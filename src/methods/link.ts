import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';
import { PathLike } from 'fs';

Object.assign(TestFs.prototype, {
    link(this: TestFs, ...args: any[]): void {
        this.callAsync(this.linkSync, ...args);
    },
    linkSync(this: TestFs, existingPath: PathLike, newPath: PathLike): void {
        throw new TestFsError('ENOTSUP', 'link', existingPath);
    },
});
