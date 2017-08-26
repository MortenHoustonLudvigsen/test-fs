import { TestFs } from '../TestFs';
import { PathAction } from '../Action';
import { Entry, DirectoryEntry, FileEntry, NotExistsEntry } from '../Entry';

declare module '../TestFs' {
    interface TestFs {
        mkdirpSync(path: string, mode?: number): void;
        mkdirp(path: string, callback: Callback<void>): void;
        mkdirp(path: string, mode: number, callback: Callback<void>): void;
    }
}

Object.assign(TestFs.prototype, {
    mkdirpSync(this: TestFs, path: string, mode: number = 0o777): void {
        this.runAction(new MkDirpAction(path, mode));
    },
    mkdirp(this: TestFs, ...args: any[]): void {
        this.callAsync(this.mkdirpSync, ...args);
    }
});

class MkDirpAction extends PathAction<void> {
    constructor(path: string, readonly mode: number) {
        super(path);
    }

    readonly name = 'mkdirp';

    private mkdirp(entry: Entry): DirectoryEntry {
        switch (entry.type) {
            case 'initial':
                return this.mkdirp(this.loadPhysicalEntry(entry));
            case 'directory':
                // Already a directory
                return entry;
            case 'file':
                throw this.error('ENOTDIR', entry.path);
            case 'none':
                return this.next({
                    ...DirectoryEntry(entry, {}),
                    virtual: true,
                    mode: this.mode,
                    mtime: this.time,
                    atime: this.time,
                    ctime: this.time,
                    birthtime: this.time
                }, 'mkdir');
        }
    }

    protected reduceParentBefore(entry: Entry): { entry: Entry, final?: boolean } {
        return { entry: this.mkdirp(entry) };
    }

    protected reduceDirectory(entry: DirectoryEntry): Entry {
        return this.mkdirp(entry);
    }

    protected reduceFile(entry: FileEntry): Entry {
        throw this.error('EEXIST', entry.path);
    }

    protected reduceNotExists(entry: NotExistsEntry): Entry {
        return this.mkdirp(entry);
    }
}
