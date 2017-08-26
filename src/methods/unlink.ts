import { TestFs, Callback } from '../TestFs';
import { PathAction } from '../Action';
import { Entry, DirectoryEntry, FileEntry, NotExistsEntry } from '../Entry';

Object.assign(TestFs.prototype, {
    unlinkSync(this: TestFs, path: string): void {
        this.runAction(new UnlinkAction(path));
    },
    unlink(this: TestFs, path: string, callback: Callback<void>): void {
        this.callAsync(this.unlinkSync, path, callback);
    }
});

class UnlinkAction extends PathAction<void> {
    readonly name = 'unlink';

    private unlink(entry: Entry): Entry {
        switch (entry.type) {
            case 'initial':
                return this.unlink(this.loadPhysicalEntry(entry));
            case 'directory':
                let entries = entry.entries;

                for (const name of Object.keys(entry.entries)) {
                    const child = entry.entries[name];
                    if (child.type !== 'none') {
                        entries = { ...entries, [child.name]: this.unlink(child) };
                    }
                }

                return this.next({
                    ...NotExistsEntry(entry),
                    virtual: true,
                    entries: entries,
                    mtime: this.time,
                    atime: this.time,
                    ctime: this.time,
                    birthtime: this.time
                })
            case 'file':
                return this.next({
                    ...NotExistsEntry(entry),
                    virtual: true,
                    mtime: this.time,
                    atime: this.time,
                    ctime: this.time,
                    birthtime: this.time
                })
            case 'none':
                return entry;
        }
    }

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
        return this.unlink(entry);
    }

    protected reduceFile(entry: FileEntry): Entry {
        return this.unlink(entry);
    }

    protected reduceNotExists(entry: NotExistsEntry): Entry {
        throw this.error('ENOENT', entry.path);
    }
}
