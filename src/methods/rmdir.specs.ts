import { testPaths, promise, call } from '../test';
import { SnapshotTestCase } from './test-cases';

class TestCase extends SnapshotTestCase {
    readonly event = 'rmdir';

    get expectedString(): string {
        return 'remove';
    }

    getResult(result: any): any {
        return this.path && this.fs.getEntry(this.path) || undefined;
    }

    verifyResult(results: any) {
        expect(results).not.toBeUndefined();
        expect(results.type).toBe('none');
        expect(results).toMatchSnapshot();
    }
}

const testCases = [
    new TestCase(/ENOENT/, 'a directory, in a directory, that does not exist', testPaths.virtualFileInVirtualDir),
    new TestCase(/ENOENT/, 'a directory, in a file', testPaths.virtualFileInPhysicalFile),
    new TestCase(/ENOENT/, 'a directory, that does not exist', testPaths.virtualDir),
    new TestCase(/ENOTDIR/, 'a file', testPaths.physicalFile),
    new TestCase(/ENOTEMPTY/, 'a directory, that is not empty', testPaths.physicalDir),
    new TestCase('snapshot', 'a physical directory, that is empty', testPaths.emptyPhysicalDir),
    new TestCase('snapshot', 'a virtual directory, that is empty', testPaths.virtualDir, (fs, path) => fs.mkdirSync(path)),
];

testCases.forEach(testCase => {
    it(`rmdirSync() ${testCase.title}`, () => {
        const fs = testCase.init();
        const [err, result] = call(fs, fs.rmdirSync, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`rmdirSync() ${testCase.eventsTitle}`, () => {
        const fs = testCase.init();
        call(fs, fs.rmdirSync, testCase.path);
        testCase.verifyEvents();
    });
});

testCases.forEach(testCase => {
    it(`rmdir() ${testCase.title}`, async () => {
        const fs = testCase.init();
        const [err, result] = await promise(fs, fs.rmdir, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`rmdir() ${testCase.eventsTitle}`, async () => {
        const fs = testCase.init();
        await promise(fs, fs.rmdir, testCase.path);
        testCase.verifyEvents();
    });
});
