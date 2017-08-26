import { TestFs } from '../TestFs';
import { PathAction } from '../Action';
import { Entry, DirectoryEntry, FileEntry, NotExistsEntry } from '../Entry';

declare module '../TestFs' {
    interface TestFs {
        getEntry(path: string): Entry | undefined;
    }
}

Object.assign(TestFs.prototype, {
    getEntry(this: TestFs, path: string): Entry | undefined {
        return this.runAction(new GetEntryAction(path));
    }
});

class GetEntryAction extends PathAction<Entry | undefined> {
    readonly name = 'getEntry';

    protected reduceParentBefore(entry: Entry): { entry: Entry, final?: boolean } {
        switch (entry.type) {
            case 'directory':
                return { entry };
            case 'initial':
            case 'file':
            case 'none':
                this.setResult(undefined);
                return { entry, final: true };
        }
    }

    protected reduceDirectory(entry: DirectoryEntry): Entry {
        this.setResult(entry);
        return entry;
    }

    protected reduceFile(entry: FileEntry): Entry {
        this.setResult(entry);
        return entry;
    }

    protected reduceNotExists(entry: NotExistsEntry): Entry {
        this.setResult(entry);
        return entry;
    }
}
