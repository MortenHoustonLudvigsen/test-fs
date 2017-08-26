import { TestFs } from 'test-fs';
import { testPaths, promise, call } from '../test';
import { ValueTestCase } from './test-cases';

class TestCase extends ValueTestCase<number> {
    readonly event = 'chmod';

    constructor(
        readonly expected: number | RegExp,
        name: string,
        pathOrFd: string | number,
        _init: (fs: TestFs, path: string) => void = (() => { })
    ) {
        super(expected, name, pathOrFd, _init);
        this.mode = typeof expected === 'number' ? expected : 0o777;
    }

    readonly mode: number;

    get expectedString(): string {
        return 'set the mode for';
    }

    getResult(result: any): any {
        const entry = this.fs.getEntry(this.path);
        return entry && entry.mode || undefined;
    }
}

const testCases = [
    new TestCase(/ENOENT/, 'an entry, that does not exist', testPaths.virtualFile),
    new TestCase(0o123, 'a directory, that exists in the physical file system', testPaths.physicalDir),
    new TestCase(0o234, 'a file, that exists in the physical file system', testPaths.physicalFile),
    new TestCase(0o345, 'a virtual directory', testPaths.virtualDir, (fs, path) => fs.mkdirSync(path)),
    new TestCase(0o456, 'a virtual file', testPaths.virtualFile, (fs, path) => fs.writeFileSync(path, new Buffer([254, 253, 42, 43]))),
    new TestCase(/ENOENT/, 'a deleted directory', testPaths.physicalDir, (fs, path) => fs.unlinkSync(path)),
    new TestCase(/ENOENT/, 'a deleted file', testPaths.physicalFile, (fs, path) => fs.unlinkSync(path)),
];

testCases.forEach(testCase => {
    it(`chmodSync() ${testCase.title}`, () => {
        const fs = testCase.init();
        const [err, result] = call(fs, fs.chmodSync, testCase.path, testCase.mode);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`chmodSync() ${testCase.eventsTitle}`, () => {
        const fs = testCase.init();
        call(fs, fs.chmodSync, testCase.path, testCase.mode);
        testCase.verifyEvents();
    });
});

testCases.forEach(testCase => {
    it(`chmod() ${testCase.title}`, async () => {
        const fs = testCase.init();
        const [err, result] = await promise(fs, fs.chmod, testCase.path, testCase.mode);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`chmod() ${testCase.eventsTitle}`, async () => {
        const fs = testCase.init();
        await promise(fs, fs.chmod, testCase.path, testCase.mode);
        testCase.verifyEvents();
    });
});
