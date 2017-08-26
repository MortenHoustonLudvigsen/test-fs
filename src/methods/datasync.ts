import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    fdatasync(this: TestFs, ...args: any[]): void {
        this.callAsync(this.fdatasyncSync, ...args);
    },
    fdatasyncSync(this: TestFs, fd: number, ...args: any[]): void {
        throw new TestFsError('ENOTSUP', 'fdatasync', fd);
    },
});
