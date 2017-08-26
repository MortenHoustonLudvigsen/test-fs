import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    read(this: TestFs, ...args: any[]): void {
        this.callAsync(this.readSync, ...args);
    },
    readSync(this: TestFs, fd: number, ...args: any[]): void {
        throw new TestFsError('ENOTSUP', 'read', fd);
    },
});
