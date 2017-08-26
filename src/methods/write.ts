import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    write(this: TestFs, ...args: any[]): void {
        this.callAsync(this.writeSync, ...args);
    },
    writeSync(this: TestFs, fd: number, ...args: any[]): void {
        throw new TestFsError('ENOTSUP', 'write', fd);
    },
});
