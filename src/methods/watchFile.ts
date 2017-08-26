import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';
import { PathLike } from 'fs';

Object.assign(TestFs.prototype, {
    watchFile(this: TestFs, filename: PathLike, ...args: any[]): void {
        throw new TestFsError('ENOTSUP', 'watchFile', filename);
    },
    unwatchFile(this: TestFs, filename: PathLike, ...args: any[]) {
        throw new TestFsError('ENOTSUP', 'unwatchFile', filename);
    }
});
