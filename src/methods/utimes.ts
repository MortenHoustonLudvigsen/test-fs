import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    utimesSync(this: TestFs, ...args: any[]): string {
        throw new TestFsError('ENOTSUP', 'utimes', ...args);
    },
    utimes(this: TestFs, ...args: any[]) {
        this.callAsync(this.utimesSync, ...args);
    },
    futimesSync(this: TestFs, ...args: any[]): string {
        throw new TestFsError('ENOTSUP', 'utimes', ...args);
    },
    futimes(this: TestFs, ...args: any[]) {
        this.callAsync(this.futimesSync, ...args);
    },
});
