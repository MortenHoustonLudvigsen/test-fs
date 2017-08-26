import { TestFs } from 'test-fs';
import { testPaths, call, promise } from '../test';
import { SnapshotTestCase } from './test-cases';

class TestCase extends SnapshotTestCase {
    readonly event = 'unlink';

    constructor(
        readonly expected: 'snapshot' | RegExp,
        readonly eventCount: number,
        name: string,
        path: string,
        _init: (fs: TestFs, path: string) => void = (() => { })
    ) {
        super(expected, name, path, _init);
    }
    
    get expectedString(): string {
        return 'delete';
    }

    getResult(result: any): any {
        return this.fs.getEntry(this.path);
    }

    verifyResult(results: any) {
        expect(results).not.toBeUndefined();
        expect(results.type).toBe('none');
        expect(results).toMatchSnapshot();
    }
}

const testCases = [
    new TestCase(/ENOENT/, 0, 'a directory, in a directory, that does not exist', testPaths.virtualFileInVirtualDir),
    new TestCase(/ENOENT/, 0, 'a directory, in a file', testPaths.virtualFileInPhysicalFile),
    new TestCase(/ENOENT/, 0, 'a directory, that does not exist', testPaths.virtualDir),
    new TestCase('snapshot', 1, 'a physical file', testPaths.physicalFile),
    new TestCase('snapshot', 1, 'a virtual file', testPaths.virtualFile, (fs, path) => fs.writeFileSync(path, 'dummy')),
    new TestCase('snapshot', 5, 'a directory, that is not empty', testPaths.physicalDir),
    new TestCase('snapshot', 1, 'a physical directory, that is empty', testPaths.emptyPhysicalDir),
    new TestCase('snapshot', 1, 'a virtual directory, that is empty', testPaths.virtualDir, (fs, path) => fs.mkdirSync(path)),
];

testCases.forEach(testCase => {
    it(`unlinkSync() ${testCase.title}`, () => {
        const fs = testCase.init();
        const [err, result] = call(fs, fs.unlinkSync, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`unlinkSync() ${testCase.eventsTitle}`, () => {
        const fs = testCase.init();
        call(fs, fs.unlinkSync, testCase.path);
        testCase.verifyEvents();
    });
});

testCases.forEach(testCase => {
    it(`unlink() ${testCase.title}`, async () => {
        const fs = testCase.init();
        const [err, result] = await promise(fs, fs.unlink, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`unlink() ${testCase.eventsTitle}`, async () => {
        const fs = testCase.init();
        await promise(fs, fs.unlink, testCase.path);
        testCase.verifyEvents();
    });
});
