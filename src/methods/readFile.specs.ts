import { testPaths, call, promise } from '../test';
import { SnapshotTestCase } from './test-cases';

class TestCase extends SnapshotTestCase {
    readonly event = 'readFile';

    get expectedString(): string {
        return 'return contents for';
    }

    getResult(result: any): any {
        const entry = this.fs.getEntry(this.path);
        if (entry && entry.type === 'file') {
            return entry.contents;
        }
        return fail(`Entry is not a file`);
    }
}

const testCases = [
    new TestCase(/ENOENT/, 'an entry, that does not exist', testPaths.virtualFile),
    new TestCase(/EISDIR/, 'a directory, that exists in the physical file system', testPaths.physicalDir),
    new TestCase('snapshot', 'a file, that exists in the physical file system', testPaths.physicalFile),
    new TestCase(/EISDIR/, 'a virtual directory', testPaths.virtualDir, (fs, path) => fs.mkdirSync(path)),
    new TestCase('snapshot', 'a virtual file', testPaths.virtualFile, (fs, path) => fs.writeFileSync(path, new Buffer([254, 253, 42, 43]))),
    new TestCase(/ENOENT/, 'a deleted directory', testPaths.physicalDir, (fs, path) => fs.unlinkSync(path)),
    new TestCase(/ENOENT/, 'a deleted file', testPaths.physicalFile, (fs, path) => fs.unlinkSync(path)),
];

testCases.forEach(testCase => {
    it(`readFileSync() ${testCase.title}`, () => {
        const fs = testCase.init();
        const [err, result] = call(fs, <any>fs.readFileSync, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`readFileSync() ${testCase.eventsTitle}`, () => {
        const fs = testCase.init();
        call(fs, <any>fs.readFileSync, testCase.path);
        testCase.verifyEvents();
    });
});

testCases.forEach(testCase => {
    it(`readFile() ${testCase.title}`, async () => {
        const fs = testCase.init();
        const [err, result] = await promise(fs, fs.readFile, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`readFile() ${testCase.eventsTitle}`, async () => {
        const fs = testCase.init();
        await promise(fs, fs.readFile, testCase.path);
        testCase.verifyEvents();
    });
});
