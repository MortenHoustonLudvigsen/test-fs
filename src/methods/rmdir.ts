import { TestFs, Callback } from '../TestFs';
import { PathAction } from '../Action';
import { Entry, DirectoryEntry, FileEntry, NotExistsEntry } from '../Entry';

Object.assign(TestFs.prototype, {
    rmdirSync(this: TestFs, path: string): void {
        this.runAction(new RmDirAction(path));
    },
    rmdir(this: TestFs, path: string, callback: Callback<void>): void {
        this.callAsync(this.rmdirSync, path, callback);
    }
});

class RmDirAction extends PathAction<void> {
    readonly name = 'rmdir';

    protected reduceParentBefore(entry: Entry): { entry: Entry, final?: boolean } {
        switch (entry.type) {
            case 'initial':
                return this.reduceParentBefore(this.loadPhysicalEntry(entry));
            case 'directory':
                return { entry };
            case 'file':
            case 'none':
                throw this.error('ENOENT', entry.path);
        }
    }

    protected reduceDirectory(entry: DirectoryEntry): Entry {
        entry = this.loadPhysicalDirectory(entry);

        if (Object.keys(entry.entries).some(name => entry.entries[name].type !== 'none')) {
            throw this.error('ENOTEMPTY', entry.path);
        }

        return this.next({
            ...NotExistsEntry(entry),
            virtual: true,
            mtime: this.time,
            atime: this.time,
            ctime: this.time,
            birthtime: this.time
        });
    }

    protected reduceFile(entry: FileEntry): Entry {
        throw this.error('ENOTDIR', entry.path);
    }

    protected reduceNotExists(entry: NotExistsEntry): Entry {
        throw this.error('ENOENT', entry.path);
    }
}
