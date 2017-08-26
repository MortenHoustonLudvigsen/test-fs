import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    accessSync(this: TestFs, path: string, mode?: number): void {
        throw new TestFsError('ENOTSUP', 'access', path);
    },
    access(this: TestFs, path: string, ...args: any[]) {
        this.callAsync(this.accessSync, path, ...args);
    }
});
