import { testPaths, promise, call } from '../test';
import { SnapshotTestCase } from './test-cases';

class TestCase extends SnapshotTestCase {
    readonly event = 'mkdir';

    get expectedString(): string {
        return 'make a directory for ';
    }

    getResult(result: any): any {
        return this.fs.getEntry(this.path);
    }
}

const testCases = [
    new TestCase(/ENOENT/, 'an entry, in a directory, that does not exist', testPaths.virtualFileInVirtualDir),
    new TestCase(/ENOTDIR/, 'an entry, in a file', testPaths.virtualFileInPhysicalFile),
    new TestCase(/EEXIST/, 'a directory, that exists in the physical file system', testPaths.physicalDir),
    new TestCase(/EEXIST/, 'a file, that exists in the physical file system', testPaths.physicalFile),
    new TestCase('snapshot', 'an entry in a physical directory', testPaths.virtualDir),
    new TestCase('snapshot', 'an entry in a virtual directory', testPaths.virtualDirInVirtualDir, (fs, path) => fs.mkdirSync(testPaths.virtualDir)),
];

testCases.forEach(testCase => {
    it(`mkdirSync() ${testCase.title}`, () => {
        const fs = testCase.init();
        const [err, result] = call(fs, fs.mkdirSync, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`mkdirSync() ${testCase.eventsTitle}`, () => {
        const fs = testCase.init();
        call(fs, fs.mkdirSync, testCase.path);
        testCase.verifyEvents();
    });
});

testCases.forEach(testCase => {
    it(`mkdir() ${testCase.title}`, async () => {
        const fs = testCase.init();
        const [err, result] = await promise<string, void>(fs, fs.mkdir, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`mkdir() ${testCase.eventsTitle}`, async () => {
        const fs = testCase.init();
        await promise<string, void>(fs, fs.mkdir, testCase.path);
        testCase.verifyEvents();
    });
});
