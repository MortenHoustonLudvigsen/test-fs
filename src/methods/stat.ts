import { TestFs, Callback } from '../TestFs';
import { PathAction } from '../Action';
import { Stats, Entry, DirectoryEntry, FileEntry, NotExistsEntry } from '../Entry';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    statSync(this: TestFs, path: string): Stats {
        return this.runAction(new StatAction(path));
    },
    stat(this: TestFs, path: string, callback: Callback<Stats>): void {
        this.callAsync(this.statSync, path, callback);
    },
    fstatSync(this: TestFs, fd: number): Stats {
        throw new TestFsError('ENOTSUP', 'stat', fd);
    },
    fstat(this: TestFs, fd: number, callback: Callback<Stats>): void {
        this.callAsync(this.fstatSync, fd, callback);
    },
    lstatSync(this: TestFs, path: string): Stats {
        throw new TestFsError('ENOTSUP', 'stat', path);
    },
    lstat(this: TestFs, path: string, callback: Callback<Stats>): void {
        this.callAsync(this.lstatSync, path, callback);
    },
});

class StatAction extends PathAction<Stats> {
    readonly name = 'stat';

    protected reduceDirectory(entry: DirectoryEntry): Entry {
        entry = this.next({
            ...entry,
            atime: this.time,
            statCount: entry.statCount + 1
        });
        this.setResult(entry);
        return entry;
    }

    protected reduceFile(entry: FileEntry): Entry {
        entry = this.next({
            ...entry,
            atime: this.time,
            statCount: entry.statCount + 1
        });
        this.setResult(entry);
        return entry;
    }

    protected reduceNotExists(entry: NotExistsEntry): Entry {
        throw this.error('ENOENT', entry.path);
    }
}
