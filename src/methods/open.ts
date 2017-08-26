import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';
import { PathLike } from 'fs';

Object.assign(TestFs.prototype, {
    open(this: TestFs, ...args: any[]): void {
        this.callAsync(this.openSync, ...args);
    },
    openSync(this: TestFs, path: PathLike, flags: string | number, mode?: string | number | null): number {
        throw new TestFsError('ENOTSUP', 'open', path);
    },
});
