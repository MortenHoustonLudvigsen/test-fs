import { TestFs } from '../TestFs';
import { Entry } from '../Entry';

declare module '../TestFs' {
    interface TestFs {
        enumerate(predicate?: (entry: Entry) => boolean): Entry[];
    }
}

Object.assign(TestFs.prototype, {
    enumerate(this: TestFs, predicate?: (entry: Entry) => boolean): Entry[] {
        predicate = predicate || (() => true);
        const entries: Entry[] = [];
        for (const name of Object.keys(this.root)) {
            enumerateEntry(this, this.root[name], predicate, entries);
        }
        return entries;
    }
});

function enumerateEntry(fs: TestFs, entry: Entry, predicate: (entry: Entry) => boolean, entries: Entry[]) {
    if (predicate(entry)) {
        entries.push(entry);
    }
    if (entry.type === 'directory') {
        for (const name of Object.keys(entry.entries)) {
            enumerateEntry(fs, entry.entries[name], predicate, entries);
        }
    }
}

