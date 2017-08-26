import { TestFs } from '../TestFs';
import { PathAction } from '../Action';
import { Entry, DirectoryEntry, FileEntry, NotExistsEntry } from '../Entry';

Object.assign(TestFs.prototype, {
    existsSync(this: TestFs, path: string): boolean {
        return this.runAction(new ExistsAction(path));
    },
    exists(this: TestFs, path: string, callback: (exists: boolean) => any) {
        callback(this.existsSync(path));
    }
});

class ExistsAction extends PathAction<boolean> {
    readonly name = 'exists';

    protected reduceParentBefore(entry: Entry): { entry: Entry, final?: boolean } {
        switch (entry.type) {
            case 'initial':
                return this.reduceParentBefore(this.loadPhysicalEntry(entry));
            case 'directory':
                return { entry };
            case 'file':
            case 'none':
                this.setResult(false);
                return { entry, final: true };
        }
    }

    protected reduceDirectory(entry: DirectoryEntry): Entry {
        this.setResult(true);
        return entry;
    }

    protected reduceFile(entry: FileEntry): Entry {
        this.setResult(true);
        return entry;
    }

    protected reduceNotExists(entry: NotExistsEntry): Entry {
        this.setResult(false);
        return entry;
    }
}
