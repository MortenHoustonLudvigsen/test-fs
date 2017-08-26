import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    createWriteStream(this: TestFs, path: string/*, options: any */): any {
        throw new TestFsError('ENOTSUP', 'createWriteStream', path);
    }
});
