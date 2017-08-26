import { EntryMap, Entry, DirectoryEntry, FileEntry, NotExistsEntry } from './Entry';
import { Action } from './Action';

export class CompositeAction<TResult> extends Action<TResult[]> {
    constructor(...actions: Action<TResult>[]) {
        super();
        this.actions = actions;
    }

    readonly actions: Action<any>[]

    reduce(root: EntryMap, time: Date = new Date()): EntryMap {
        this.time = time;
        root = this.actions.reduce((root, action) => action.reduce(root, time), root);
        this.setResult(this.actions.map(action => action.result));
        return root;
    }

    protected reduceDirectory(entry: DirectoryEntry): Entry {
        return entry;
    }

    protected reduceFile(entry: FileEntry): Entry {
        return entry;
    }

    protected reduceNotExists(entry: NotExistsEntry): Entry {
        return entry;
    }
}
