import * as fs from 'fs';
import { EventEmitter } from 'events';
import { TestFsError } from './TestFsError';
import { invariant } from './utils';
import { EntryMap, Stats, Entry, InitialEntry, DirectoryEntry, FileEntry, NotExistsEntry, validateEntry } from './Entry';
import { resolve as resolvePath } from 'path';

export function splitPath(path: string): string[] {
    invariant(typeof path === 'string', 'path must be a string');
    return resolvePath(path)
        .split(/[\\\/]+/g)
        .map((segment, index) => index === 0 ? resolvePath(segment + '/') : segment)
        .filter(segment => !!segment);
}

export abstract class Action<TResult> extends EventEmitter {
    readonly name: string;
    protected time = new Date();

    abstract reduce(root: EntryMap, time?: Date): EntryMap;

    private _result: TResult;
    get result() {
        return this._result;
    }
    protected setResult(result: TResult) {
        this._result = result;
    }

    protected next<TEntry extends Entry>(entry: TEntry, operation?: string): TEntry {
        this.emit('next', operation || this.name, entry);
        return validateEntry(entry);
    }

    protected error(errCode: string, path: string): TestFsError {
        return new TestFsError(errCode, this.name, path);
    }
}

export abstract class PathAction<TResult> extends Action<TResult> {
    constructor(readonly path: string) {
        super();
        invariant(typeof path === 'string', 'path must be a string');
        this.path = resolvePath(path);
    }

    reduce(root: EntryMap, time: Date = new Date()): EntryMap {
        this.time = time;
        const [segment, ...segments] = splitPath(this.path);
        const entry = root[segment];
        const reducedEntry = this._reduceEntry(root[segment], undefined, segment, segments);
        return reducedEntry !== entry ? { ...root, [segment]: reducedEntry } : root;
    }

    protected reduceParentBefore(entry: Entry): { entry: Entry, final?: boolean } {
        return { entry };
    }

    protected reduceParent(entry: DirectoryEntry, child: Entry): DirectoryEntry {
        child; // to avoid syntax error
        return entry;
    }

    protected abstract reduceDirectory(entry: DirectoryEntry): Entry;
    protected abstract reduceFile(entry: FileEntry): Entry;
    protected abstract reduceNotExists(entry: NotExistsEntry): Entry;

    private _reduceEntry(entry: Entry | undefined, dir: string | undefined, segment: string, segments: string[]): Entry {
        if (!entry) {
            return this._reduceEntry(this.next(InitialEntry(dir, segment), 'initialize'), dir, segment, segments);
        }

        if (entry.type === 'initial') {
            return this._reduceEntry(this.loadPhysicalEntry(entry), dir, segment, segments);
        }

        if (segments.length === 0) {
            switch (entry.type) {
                case 'directory':
                    return this.reduceDirectory(entry);
                case 'file':
                    return this.reduceFile(entry);
                case 'none':
                    return this.reduceNotExists(entry);
            }
        }

        return this._reduceDirectory(entry, segments);
    }

    private _reduceDirectory(entry: Entry, restSegments: string[]): Entry {
        const { entry: directory, final } = this.reduceParentBefore(entry);

        if (final) {
            return directory;
        }

        if (directory.type !== 'directory') {
            throw this.error('ENOTDIR', directory.path);
        }

        const [name, ...segments] = restSegments;
        const child = this._reduceEntry(directory.entries[name], directory.path, name, segments);
        return this.reduceParent(this.addOrReplaceEntry(directory, child), child);
    }

    protected addOrReplaceEntry(directory: DirectoryEntry, entry: Entry): DirectoryEntry {
        if (directory.entries[entry.name] !== entry) {
            return this.next({
                ...directory,
                virtual: true,
                entries: { ...directory.entries, [entry.name]: entry }
            }, 'addOrReplace');
        } else {
            return directory;
        }
    }

    protected loadPhysicalDirectory(directory: DirectoryEntry): DirectoryEntry {
        let entries = directory.entries;

        for (const name of Object.keys(directory.entries)) {
            const entry = directory.entries[name];
            if (entry.type === 'initial') {
                entries = { ...entries, [entry.name]: this.loadPhysicalEntry(entry) };
            }
        }

        return entries !== directory.entries ? this.next({
            ...DirectoryEntry(directory, entries),
            virtual: true,
            mtime: this.time,
            atime: this.time,
            ctime: this.time,
            mode: directory.mode
        }, 'load-directory') : directory;
    }

    protected loadPhysicalEntry(entry: Entry): Entry {
        if (entry.type === 'initial') {
            const entryFromFs = readEntryFromPhysicalFs(entry.path);
            switch (entryFromFs.type) {
                case 'directory':
                    const entries: EntryMap = {};
                    for (const name of entryFromFs.entries) {
                        entries[name] = InitialEntry(entry.path, name);
                    }
                    return this.next({
                        ...DirectoryEntry(entry, entries),
                        ...entryFromFs.stats
                    }, 'load');
                case 'file':
                    return this.next({
                        ...FileEntry(entry, entryFromFs.contents),
                        ...entryFromFs.stats
                    }, 'load');
                case 'none':
                default:
                    return this.next({
                        ...NotExistsEntry(entry),
                        mtime: this.time,
                        atime: this.time,
                        ctime: this.time,
                        birthtime: this.time
                    }, 'load');
            }
        } else {
            return entry;
        }
    }
}


function statFromPhysicalFs(path: string): fs.Stats | undefined {
    try {
        return fs.statSync(path);
    } catch (err) {
        return undefined;
    }
}

function readDirFromPhysicalFs(path: string): string[] | undefined {
    try {
        return fs.readdirSync(path);
    } catch (err) {
        return undefined;
    }
}

function readFileFromPhysicalFs(path: string): Buffer | undefined {
    try {
        return fs.readFileSync(path);
    } catch (err) {
        return undefined;
    }
}

interface FileEntryFromPhysicalFs {
    type: 'file';
    contents: Buffer;
    stats: Partial<Stats>;
}

interface DirectoryEntryFromPhysicalFs {
    type: 'directory';
    entries: string[];
    stats: Partial<Stats>;
}

interface NotExistsEntryFromPhysicalFs {
    type: 'none';
}

function statsToEntryStats(stats?: fs.Stats): Partial<Stats> {
    if (stats) {
        const { mode, atime, mtime, ctime, birthtime } = stats;
        return { mode, atime, mtime, ctime, birthtime };
    }
    return {};
}

function readEntryFromPhysicalFs(path: string): FileEntryFromPhysicalFs | DirectoryEntryFromPhysicalFs | NotExistsEntryFromPhysicalFs {
    const stats = statFromPhysicalFs(path);
    if (stats && stats.isDirectory!()) {
        const entries = readDirFromPhysicalFs(path);
        if (entries) {
            return {
                type: 'directory',
                entries,
                stats: statsToEntryStats(stats)
            };
        }
    } else if (stats && stats.isFile!()) {
        const contents = readFileFromPhysicalFs(path);
        if (contents) {
            return {
                type: 'file',
                contents,
                stats: statsToEntryStats(stats)
            };
        }
    }
    return { type: 'none' };
}

