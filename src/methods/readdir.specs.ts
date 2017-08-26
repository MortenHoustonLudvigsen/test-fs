import { testPaths, promise, call } from '../test';
import { SnapshotTestCase } from './test-cases';

class TestCase extends SnapshotTestCase {
    readonly event = 'readdir';

    get expectedString(): string {
        return 'return entries for';
    }

    getResult(result: any): any {
        const entry = this.fs.getEntry(this.path);
        if (entry && entry.type === 'directory') {
            return entry.entries;
        }
        return fail(`Entry is not a directory`);
    }
}

const testCases = [
    new TestCase(/ENOENT/, 'an entry, that does not exist', testPaths.virtualFile),
    new TestCase('snapshot', 'a directory, that exists in the physical file system', testPaths.physicalDir),
    new TestCase(/ENOTDIR/, 'a file, that exists in the physical file system', testPaths.physicalFile),
    new TestCase('snapshot', 'a virtual directory', testPaths.virtualDir, (fs, path) => fs.mkdirSync(path)),
    new TestCase(/ENOTDIR/, 'a virtual file', testPaths.virtualFile, (fs, path) => fs.writeFileSync(path, new Buffer([254, 253, 42, 43]))),
    new TestCase(/ENOENT/, 'a deleted directory', testPaths.physicalDir, (fs, path) => fs.unlinkSync(path)),
    new TestCase(/ENOENT/, 'a deleted file', testPaths.physicalFile, (fs, path) => fs.unlinkSync(path)),
];

testCases.forEach(testCase => {
    it(`readdirSync() ${testCase.title}`, () => {
        const fs = testCase.init();
        const [err, result] = call(fs, fs.readdirSync, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`readdirSync() ${testCase.eventsTitle}`, () => {
        const fs = testCase.init();
        call(fs, fs.readdirSync, testCase.path);
        testCase.verifyEvents();
    });
});

testCases.forEach(testCase => {
    it(`readdir() ${testCase.title}`, async () => {
        const fs = testCase.init();
        const [err, result] = await promise(fs, fs.readdir, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`readdir() ${testCase.eventsTitle}`, async () => {
        const fs = testCase.init();
        await promise(fs, fs.readdir, testCase.path);
        testCase.verifyEvents();
    });
});
