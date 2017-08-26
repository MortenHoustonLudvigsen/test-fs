import { TestFs } from '../TestFs';
import { PathAction } from '../Action';
import { Entry, DirectoryEntry, FileEntry, NotExistsEntry } from '../Entry';

Object.assign(TestFs.prototype, {
    mkdirSync(this: TestFs, path: string, mode: number = 0o777): void {
        this.runAction(new MkDirAction(path, mode));
    },
    mkdir(this: TestFs, ...args: any[]): void {
        this.callAsync(this.mkdirSync, ...args);
    }
});

class MkDirAction extends PathAction<void> {
    constructor(path: string, readonly mode: number) {
        super(path);
    }

    readonly name = 'mkdir';

    protected reduceParentBefore(entry: Entry): { entry: Entry, final?: boolean } {
        switch (entry.type) {
            case 'initial':
                return this.reduceParentBefore(this.loadPhysicalEntry(entry));
            case 'directory':
                return { entry };
            case 'file':
                throw this.error('ENOTDIR', entry.path);
            case 'none':
                throw this.error('ENOENT', entry.path);
        }
    }

    protected reduceDirectory(entry: DirectoryEntry): Entry {
        throw this.error('EEXIST', entry.path);
    }

    protected reduceFile(entry: FileEntry): Entry {
        throw this.error('EEXIST', entry.path);
    }

    protected reduceNotExists(entry: NotExistsEntry): Entry {
        return this.next({
            ...DirectoryEntry(entry, {}),
            virtual: true,
            mode: this.mode,
            mtime: this.time,
            atime: this.time,
            ctime: this.time,
            birthtime: this.time
        });
    }
}
