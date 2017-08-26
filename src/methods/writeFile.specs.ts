import { testPaths, promise, call } from '../test';
import { SnapshotTestCase } from './test-cases';

class TestCase extends SnapshotTestCase {
    readonly event = 'writeFile';

    get expectedString(): string {
        return 'write';
    }

    getResult(result: any): any {
        return this.fs.getEntry(this.path);
    }
}

const testCases = [
    new TestCase(/ENOTDIR/, 'an entry, in a directory, that does not exist', testPaths.virtualFileInVirtualDir),
    new TestCase(/ENOTDIR/, 'an entry, in a file', testPaths.virtualFileInPhysicalFile),
    new TestCase(/EISDIR/, 'a directory, that exists in the physical file system', testPaths.physicalDir),
    new TestCase('snapshot', 'a file, that exists in the physical file system', testPaths.physicalFile),
    new TestCase('snapshot', 'a file in a physical directory', testPaths.virtualFile),
    new TestCase('snapshot', 'a file in a virtual directory', testPaths.virtualFileInVirtualDir, (fs, path) => fs.mkdirSync(testPaths.virtualDir)),
];

testCases.forEach(testCase => {
    it(`writeFileSync() ${testCase.title}`, () => {
        const fs = testCase.init();
        const [err, result] = call<string, string, void>(fs, fs.writeFileSync, testCase.path, 'dummy');
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`writeFileSync() ${testCase.eventsTitle}`, () => {
        const fs = testCase.init();
        call<string, string, void>(fs, fs.writeFileSync, testCase.path, 'dummy');
        testCase.verifyEvents();
    });
});

testCases.forEach(testCase => {
    it(`writeFile() ${testCase.title}`, async () => {
        const fs = testCase.init();
        const [err, result] = await promise<string, string, void>(fs, fs.writeFile, testCase.path, 'dummy');
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`writeFile() ${testCase.eventsTitle}`, async () => {
        const fs = testCase.init();
        await promise<string, string, void>(fs, fs.writeFile, testCase.path, 'dummy');
        testCase.verifyEvents();
    });
});
