import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    fsync(this: TestFs, ...args: any[]): void {
        this.callAsync(this.fsyncSync, ...args);
    },
    fsyncSync(this: TestFs, fd: number, ...args: any[]): void {
        throw new TestFsError('ENOTSUP', 'fsync', fd);
    },
});
