import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';
import { PathLike } from 'fs';

Object.assign(TestFs.prototype, {
    symlink(this: TestFs, ...args: any[]): void {
        this.callAsync(this.symlinkSync, ...args);
    },
    symlinkSync(this: TestFs, target: PathLike, path: PathLike, type?: string | null): void {
        throw new TestFsError('ENOTSUP', 'symlink', target);
    },
});
