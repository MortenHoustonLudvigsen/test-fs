import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    mkdtempSync(this: TestFs, ...args: any[]): string {
        throw new TestFsError('ENOTSUP', 'mkdtemp', ...args);
    },
    mkdtemp(this: TestFs, ...args: any[]) {
        this.callAsync(this.mkdtempSync, ...args);
    }
});
