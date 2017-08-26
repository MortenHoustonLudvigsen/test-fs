import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    truncate(this: TestFs, ...args: any[]): void {
        this.callAsync(this.truncateSync, ...args);
    },
    truncateSync(path: string, len?: number | null): void {
        throw new TestFsError('ENOTSUP', 'truncate', path);
    },
    ftruncate(this: TestFs, ...args: any[]): void {
        this.callAsync(this.ftruncateSync, ...args);
    },
    ftruncateSync(fd: number, len?: number | null): void {
        throw new TestFsError('ENOTSUP', 'truncate', fd);
    },
});
