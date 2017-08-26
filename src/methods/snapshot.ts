import { TestFs, Snapshot } from '../TestFs';
import { Entry, FileEntry } from '../Entry';
import { resolve as resolvePath, relative as relativePath } from 'path';

declare module '../TestFs' {
    interface TestFs {
        snapshot(root: string): Snapshot;
    }
}

Object.assign(TestFs.prototype, {
    snapshot(this: TestFs, root: string): Snapshot {
        function getPath(entry: Entry) {
            return relativePath(root, entry.path).replace(/\\/g, '/');
        }

        function getContents(entry: FileEntry) {
            if (typeof entry.contents === 'string') {
                return entry.contents;
            }
            if (Buffer.isBuffer(entry.contents)) {
                return Array.from(entry.contents);
            }
            return undefined;
        }

        root = resolvePath(root);
        const snapshot: Snapshot = {};
        for (const entry of this.enumerate(entry => entry.path.indexOf(root) === 0)) {
            if (entry.type === 'file') {
                const contents = getContents(entry);
                if (typeof contents !== 'undefined') {
                    snapshot[getPath(entry)] = contents;
                }
            }
        }
        return snapshot;
    }
});
