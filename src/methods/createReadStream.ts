import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    createReadStream(path: string/*, options: { start: number, end: number } */): any {
        throw new TestFsError('ENOTSUP', 'createReadStream', path);
    }
});
