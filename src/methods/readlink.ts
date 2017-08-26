import { TestFs, Callback } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    readlinkSync(this: TestFs, path: string): void {
        throw new TestFsError('ENOTSUP', 'readlink', path);
    },
    readlink(this: TestFs, path: string, callback: Callback<void>): void {
        this.callAsync(this.readlinkSync, path, callback);
    }
});
