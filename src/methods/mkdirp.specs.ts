import { TestFs } from 'test-fs';
import { testPaths, promise, call } from '../test';
import { SnapshotTestCase } from './test-cases';

class TestCase extends SnapshotTestCase {
    readonly event = 'mkdir';

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
        return 'make a directory for';
    }

    getResult(result: any): any {
        return this.fs.getEntry(this.path);
    }
}

const testCases = [
    new TestCase('snapshot', 2, 'an entry, in a directory, that does not exist', testPaths.virtualDirInVirtualDir),
    new TestCase(/ENOTDIR/, 0, 'an entry, in a file', testPaths.virtualFileInPhysicalFile),
    new TestCase('snapshot', 0, 'a directory, that exists in the physical file system', testPaths.physicalDir),
    new TestCase(/EEXIST/, 0, 'a file, that exists in the physical file system', testPaths.physicalFile),
    new TestCase('snapshot', 1, 'an entry in a physical directory', testPaths.virtualDir),
    new TestCase('snapshot', 1, 'an entry in a virtual directory', testPaths.virtualDirInVirtualDir, (fs, path) => fs.mkdirpSync(testPaths.virtualDir)),
];

testCases.forEach(testCase => {
    it(`mkdirpSync() ${testCase.title}`, () => {
        const fs = testCase.init();
        const [err, result] = call(fs, fs.mkdirpSync, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`mkdirpSync() ${testCase.eventsTitle}`, () => {
        const fs = testCase.init();
        call(fs, fs.mkdirpSync, testCase.path);
        testCase.verifyEvents();
    });
});

testCases.forEach(testCase => {
    it(`mkdirp() ${testCase.title}`, async () => {
        const fs = testCase.init();
        const [err, result] = await promise<string, void>(fs, fs.mkdirp, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`mkdirp() ${testCase.eventsTitle}`, async () => {
        const fs = testCase.init();
        await promise<string, void>(fs, fs.mkdirp, testCase.path);
        testCase.verifyEvents();
    });
});
