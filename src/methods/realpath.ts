import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    realpath(this: TestFs, ...args: any[]): void {
        this.callAsync(this.readlinkSync, ...args);
    },
    realpathSync(path: string, len?: number | null): void {
        throw new TestFsError('ENOTSUP', 'realpath', path);
    },
});
