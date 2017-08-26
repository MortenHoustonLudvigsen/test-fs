import { TestFs } from '../TestFs';
import { PathAction } from '../Action';
import { Entry, DirectoryEntry, FileEntry, NotExistsEntry } from '../Entry';

Object.assign(TestFs.prototype, {
    readFileSync(this: TestFs, path: string, options?: { encoding?: string | null; flag?: string; } | string): string | Buffer {
        let contents = this.runAction(new ReadFileAction(path));
        let encoding: string | undefined;
        if (typeof options === 'string') {
            encoding = options;
        } else if (options && options.encoding) {
            encoding = options.encoding;
        }
        if (typeof contents === 'string') {
            if (encoding === 'utf8') {
                return contents;
            }
            contents = new Buffer(contents, 'utf8');
        }
        return encoding ? contents.toString(encoding) : contents;
    },
    readFile(this: TestFs, path: string, ...args: any[]): void {
        this.callAsync(this.readFileSync, path, ...args);
    }
});

class ReadFileAction extends PathAction<string | Buffer> {
    readonly name = 'readFile';

    protected reduceDirectory(entry: DirectoryEntry): Entry {
        throw this.error('EISDIR', entry.path);
    }

    protected reduceFile(entry: FileEntry): Entry {
        entry = this.next({
            ...entry,
            atime: this.time,
            readCount: entry.readCount + 1
        });
        this.setResult(entry.contents);
        return entry;
    }

    protected reduceNotExists(entry: NotExistsEntry): Entry {
        throw this.error('ENOENT', entry.path);
    }
}
