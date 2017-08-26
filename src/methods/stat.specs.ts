import { testPaths, promise, call } from '../test';
import { SnapshotTestCase } from './test-cases';

class TestCase extends SnapshotTestCase {
    readonly event = 'stat';

    get expectedString(): string {
        return 'return stats for';
    }
}

const testCases = [
    new TestCase(/ENOENT/, 'an entry, that does not exist', testPaths.virtualFile),
    new TestCase('snapshot', 'a directory, that exists in the physical file system', testPaths.physicalDir),
    new TestCase('snapshot', 'a file, that exists in the physical file system', testPaths.physicalFile),
    new TestCase('snapshot', 'a virtual directory', testPaths.virtualDir, (fs, path) => fs.mkdirSync(path)),
    new TestCase('snapshot', 'a virtual file', testPaths.virtualFile, (fs, path) => fs.writeFileSync(path, new Buffer([254, 253, 42, 43]))),
    new TestCase(/ENOENT/, 'a deleted directory', testPaths.physicalDir, (fs, path) => fs.unlinkSync(path)),
    new TestCase(/ENOENT/, 'a deleted file', testPaths.physicalFile, (fs, path) => fs.unlinkSync(path)),
];

testCases.forEach(testCase => {
    it(`statSync() ${testCase.title}`, () => {
        const fs = testCase.init();
        const [err, result] = call(fs, fs.statSync, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`statSync() ${testCase.eventsTitle}`, () => {
        const fs = testCase.init();
        call(fs, fs.statSync, testCase.path);
        testCase.verifyEvents();
    });
});

testCases.forEach(testCase => {
    it(`stat() ${testCase.title}`, async () => {
        const fs = testCase.init();
        const [err, result] = await promise(fs, fs.stat, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`stat() ${testCase.eventsTitle}`, async () => {
        const fs = testCase.init();
        await promise(fs, fs.stat, testCase.path);
        testCase.verifyEvents();
    });
});
