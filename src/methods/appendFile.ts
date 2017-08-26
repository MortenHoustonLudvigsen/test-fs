import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    appendFileSync(this: TestFs, path: string, data: string | Buffer, options?: { encoding?: string | null; mode?: number | string; flag?: string; } | string | null): void {
        throw new TestFsError('ENOTSUP', 'appendFile', path);
    },
    appendFile(this: TestFs, ...args: any[]): void {
        this.callAsync(this.appendFileSync, ...args);
    }
});
