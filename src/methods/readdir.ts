import { TestFs, Callback } from '../TestFs';
import { PathAction } from '../Action';
import { Entry, DirectoryEntry, FileEntry, NotExistsEntry } from '../Entry';

Object.assign(TestFs.prototype, {
    readdirSync(this: TestFs, path: string): string[] {
        return this.runAction(new ReadDirAction(path));
    },
    readdir(this: TestFs, path: string, callback: Callback<string[]>): void {
        this.callAsync(this.readdirSync, path, callback);
    }
});

class ReadDirAction extends PathAction<string[]> {
    readonly name = 'readdir';

    protected reduceDirectory(entry: DirectoryEntry): Entry {
        entry = this.next({
            ...this.loadPhysicalDirectory(entry),
            atime: this.time,
            readCount: entry.readCount + 1
        });
        this.setResult(Object.keys(entry.entries)
            .filter(name => entry.entries[name].type !== 'none')
            .sort()
        );
        return entry;
    }

    protected reduceFile(entry: FileEntry): Entry {
        throw this.error('ENOTDIR', entry.path);
    }

    protected reduceNotExists(entry: NotExistsEntry): Entry {
        throw this.error('ENOENT', entry.path);
    }
}
