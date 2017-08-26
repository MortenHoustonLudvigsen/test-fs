import { TestFs } from '../TestFs';
import { PathAction } from '../Action';
import { Entry, DirectoryEntry, FileEntry, NotExistsEntry } from '../Entry';

Object.assign(TestFs.prototype, {
    writeFileSync(this: TestFs, path: string, data: string | Buffer, options?: { encoding?: string | null; mode?: number | string; flag?: string; } | string | null): void {
        options = typeof options === 'function' ? undefined : options;
        if (typeof data === 'string') {
            const encoding = typeof options === 'string' ? options : (options && options.encoding || 'utf8');
            data = new Buffer(data, encoding);
        }
        this.runAction(new WriteFileAction(path, data));
    },
    writeFile(this: TestFs, ...args: any[]): void {
        this.callAsync(this.writeFileSync, ...args);
    }
});

class WriteFileAction extends PathAction<Buffer> {
    constructor(path: string, readonly contents: Buffer) {
        super(path);
    }

    readonly name = 'writeFile';

    protected reduceDirectory(entry: DirectoryEntry): Entry {
        throw this.error('EISDIR', entry.path);
    }

    protected reduceFile(entry: FileEntry): Entry {
        return this.next({
            ...FileEntry(entry, this.contents),
            virtual: true,
            mtime: this.time,
            atime: this.time,
            ctime: this.time,
            birthtime: this.time,
            mode: entry.mode
        });
    }

    protected reduceNotExists(entry: NotExistsEntry): Entry {
        return this.next({
            ...FileEntry(entry, this.contents),
            virtual: true,
            mtime: this.time,
            atime: this.time,
            ctime: this.time,
            birthtime: this.time,
            mode: 0o777
        });
    }
}
