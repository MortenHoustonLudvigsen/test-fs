import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';
import { PathLike } from 'fs';

Object.assign(TestFs.prototype, {
    rename(this: TestFs, ...args: any[]): void {
        this.callAsync(this.renameSync, ...args);
    },
    renameSync(oldPath: PathLike, newPath: PathLike): void {
        throw new TestFsError('ENOTSUP', 'rename', oldPath);
    },
});
