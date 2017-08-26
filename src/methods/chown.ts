import { TestFs } from '../TestFs';
import { TestFsError } from '../TestFsError';

Object.assign(TestFs.prototype, {
    chown(this: TestFs, path: string, ...args: any[]) {
        this.callAsync(this.chownSync, path, ...args);
    },
    chownSync(this: TestFs, path: string, uid: number, gid: number): void {
        throw new TestFsError('ENOTSUP', 'chown', path);
    },
    fchown(this: TestFs, fd: number, ...args: any[]) {
        this.callAsync(this.fchownSync, fd, ...args);
    },
    fchownSync(this: TestFs, fd: number, uid: number, gid: number): void {
        throw new TestFsError('ENOTSUP', 'chown', fd);
    },
    lchown(this: TestFs, path: string, ...args: any[]) {
        this.callAsync(this.lchownSync, path, ...args);
    },
    lchownSync(this: TestFs, path: string, uid: number, gid: number): void {
        throw new TestFsError('ENOTSUP', 'chown', path);
    }
});
