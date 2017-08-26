import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    close(this: TestFs, ...args: any[]): void {
        this.callAsync(this.closeSync, ...args);
    },
    closeSync(this: TestFs, fd: number, ...args: any[]): void {
        throw new TestFsError('ENOTSUP', 'close', fd);
    },
});
