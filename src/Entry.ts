import { join as joinPaths } from 'path';
import { fileContents, invariant } from './utils';

export function isEntry(value: any): value is Entry {
    if (value && typeof value === 'object' && typeof value.type === 'string') {
        switch (value.type) {
            case 'initial':
            case 'directory':
            case 'file':
            case 'none':
                return true;
        }
    }
    return false;
}


export interface Stats {
    readonly dir?: string;
    readonly name: string;
    readonly path: string;
    readonly version: number;
    readonly mode?: number;
    readonly atime?: Date;
    readonly mtime?: Date;
    readonly ctime?: Date;
    readonly birthtime?: Date;
    readonly atimeMs?: number;
    readonly mtimeMs?: number;
    readonly ctimeMs?: number;
    readonly birthtimeMs?: number;
    readonly statCount: number;
    readonly readCount: number;
    readonly size?: number;
    readonly virtual?: boolean;
    isFile(): boolean;
    isDirectory(): boolean;
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isSymbolicLink(): boolean;
    isFIFO(): boolean;
    isSocket(): boolean;
}

export interface InitialEntry extends Stats {
    readonly type: 'initial';
}

export function InitialEntry(dir: string | undefined, name: string): InitialEntry {
    return {
        ...BaseEntry,
        type: 'initial',
        dir, name,
        path: dir ? joinPaths(dir, name) : name
    };
}

export interface DirectoryEntry extends Stats {
    readonly type: 'directory';
    readonly entries: EntryMap;
}

export function DirectoryEntry(previous: Entry, entries: EntryMap): DirectoryEntry {
    invariant(entries && typeof entries === 'object', 'entries must be an object');
    return {
        ...next(previous),
        type: 'directory',
        isDirectory: returnTrue,
        entries
    };
}


export interface FileEntry extends Stats {
    readonly type: 'file';
    readonly contents: string | Buffer;
}

export function FileEntry(previous: Entry, contents: string | Buffer): FileEntry {
    invariant(typeof contents === 'string' || Buffer.isBuffer(contents), 'contents must be a string or a buffer');
    return {
        ...next(previous),
        type: 'file',
        isFile: returnTrue,
        contents: fileContents(contents)
    };
}

export interface NotExistsEntry extends Stats {
    readonly type: 'none';
}

export function NotExistsEntry(previous: Entry): NotExistsEntry {
    return {
        ...next(previous),
        type: 'none'
    };
}

export type Entry = InitialEntry | DirectoryEntry | FileEntry | NotExistsEntry;

export interface EntryMap {
    [name: string]: Entry;
}

export function validateEntry<TEntry extends Entry>(entryToValidate: TEntry): TEntry {
    const entry: Entry = entryToValidate;
    invariant(!!entry, 'entry must be defined');
    invariant(!!entry.path && typeof entry.path === 'string', 'entry.path must be defined');
    switch (entry.type) {
        case 'initial':
            break;
        case 'directory':
            invariant(entry.entries && typeof entry.entries === 'object', 'entries must be an object');
            break;
        case 'file':
            invariant(typeof entry.contents === 'string' || Buffer.isBuffer(entry.contents), 'contents must be a string or a buffer', entry.path);
            break;
        case 'none':
            break;
    }
    return entryToValidate;
}

const BaseEntry: Entry = {
    path: '',
    name: '',
    version: 0,
    type: 'initial',
    statCount: 0,
    readCount: 0,
    isFile: () => false,
    isDirectory: () => false,
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isSymbolicLink: () => false,
    isFIFO: () => false,
    isSocket: () => false
};

function next(previous: Entry): Entry {
    validateEntry(previous);
    return {
        ...BaseEntry,
        dir: previous.dir,
        name: previous.name,
        path: previous.path,
        version: previous.version + 1
    };
}

function returnTrue(): boolean {
    return true;
}
