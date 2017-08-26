import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';
import { PathLike, FSWatcher } from 'fs';

Object.assign(TestFs.prototype, {
    watch(this: TestFs, filename: PathLike, ...args: any[]): FSWatcher {
        throw new TestFsError('ENOTSUP', 'watch', filename);
    },
});
