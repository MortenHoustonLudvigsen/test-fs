import { TestFs, Snapshot } from '../TestFs';
import { PathAction } from '../Action';
import { CompositeAction } from '../CompositeAction';
import { Entry, DirectoryEntry, FileEntry, NotExistsEntry } from '../Entry';
import { resolve as resolvePath } from 'path';

declare module '../TestFs' {
    interface TestFs {
        loadSnapshot(root: string, snapshot: Snapshot, time?: Date): void;
    }
}

Object.assign(TestFs.prototype, {
    loadSnapshot(this: TestFs, root: string, snapshot: Snapshot, time?: Date): void {
        const loadActions = Object.keys(snapshot)
            .map(path => new LoadSnapshotAction(resolvePath(root, path), snapshot[path]));

        this.runAction(new CompositeAction(...loadActions), time);
    }
});

class LoadSnapshotAction extends PathAction<void> {
    constructor(path: string, contents: string | number[]) {
        super(path);
        this.contents = typeof contents === 'string' ? contents : new Buffer(contents);
    }

    readonly name = 'load-snapshot';
    readonly contents: string | Buffer;

    protected reduceParentBefore(entry: Entry): { entry: Entry, final?: boolean } {
        switch (entry.type) {
            case 'initial':
                return this.reduceParentBefore(this.loadPhysicalEntry(entry));
            case 'directory':
                return { entry };
            case 'file':
            case 'none':
                return {
                    entry: this.next({
                        ...DirectoryEntry(entry, {}),
                        virtual: true,
                        mode: 0o777,
                        mtime: this.time,
                        atime: this.time,
                        ctime: this.time,
                        birthtime: this.time
                    })
                };
        }
    }

    protected reduceDirectory(entry: DirectoryEntry): Entry {
        return this.next({
            ...FileEntry(entry, this.contents),
            virtual: true,
            mtime: this.time,
            atime: this.time,
            ctime: this.time,
            birthtime: this.time,
            mode: 0o777
        });
    }

    protected reduceFile(entry: FileEntry): Entry {
        return this.next({
            ...FileEntry(entry, this.contents),
            virtual: true,
            mtime: this.time,
            atime: this.time,
            ctime: this.time
        });
    }

    protected reduceNotExists(entry: NotExistsEntry): Entry {
        return this.next({
            ...FileEntry(entry, this.contents),
            virtual: true,
            mtime: this.time,
            atime: this.time,
            ctime: this.time,
            birthtime: this.time,
            mode: 0o777
        });
    }
}
