import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';
import { PathAction } from '../Action';
import { Entry, DirectoryEntry, FileEntry, NotExistsEntry } from '../Entry';

Object.assign(TestFs.prototype, {
    chmod(this: TestFs, path: string, ...args: any[]) {
        this.callAsync(this.chmodSync, path, ...args);
    },
    chmodSync(this: TestFs, path: string, mode?: number): void {
        this.runAction(new ChmodAction(path, mode));
    },
    fchmod(this: TestFs, fd: number, ...args: any[]) {
        this.callAsync(this.fchmodSync, fd, ...args);
    },
    fchmodSync(this: TestFs, fd: number, mode?: number): void {
        throw new TestFsError('ENOTSUP', 'chmod', fd);
    },
    lchmod(this: TestFs, path: string, ...args: any[]) {
        this.callAsync(this.lchmodSync, path, ...args);
    },
    lchmodSync(this: TestFs, path: string, mode?: number): void {
        throw new TestFsError('ENOTSUP', 'chmod', path);
    }
});

class ChmodAction extends PathAction<void> {
    constructor(path: string, readonly mode: number | undefined) {
        super(path);
    }

    readonly name = 'chmod';

    protected reduceDirectory(entry: DirectoryEntry): Entry {
        return this.next({
            ...entry,
            virtual: true,
            mode: this.mode
        });
    }

    protected reduceFile(entry: FileEntry): Entry {
        return this.next({
            ...entry,
            virtual: true,
            mode: this.mode
        });
    }

    protected reduceNotExists(entry: NotExistsEntry): Entry {
        throw this.error('ENOENT', entry.path);
    }
}
