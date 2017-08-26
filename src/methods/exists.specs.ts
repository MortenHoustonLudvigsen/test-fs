import { testPaths, call, simplePromise } from '../test';
import { ValueTestCase } from './test-cases';

class TestCase extends ValueTestCase<boolean> {
    readonly event = '';
}

const testCases = [
    new TestCase(false, 'an entry, that does not exist', testPaths.virtualFile),
    new TestCase(false, 'an entry, that does not exist', testPaths.virtualFileInVirtualDir),
    new TestCase(true, 'a directory, that exists in the physical file system', testPaths.physicalDir),
    new TestCase(true, 'a file, that exists in the physical file system', testPaths.physicalFile),
    new TestCase(true, 'a virtual directory', testPaths.virtualDir, (fs, path) => fs.mkdirSync(path)),
    new TestCase(true, 'a virtual file', testPaths.virtualFile, (fs, path) => fs.writeFileSync(path, '')),
    new TestCase(false, 'a deleted directory', testPaths.physicalDir, (fs, path) => fs.unlinkSync(path)),
    new TestCase(false, 'a deleted file', testPaths.physicalFile, (fs, path) => fs.unlinkSync(path))
];

testCases.forEach(testCase => {
    it(`existsSync() ${testCase.title}`, () => {
        const fs = testCase.init();
        const [err, result] = call(fs, fs.existsSync, testCase.path);
        testCase.verify(err, result);
    });
});

testCases.forEach(testCase => {
    it(`exists() ${testCase.title}`, async () => {
        const fs = testCase.init();
        const [err, result] = await simplePromise(fs, fs.exists, testCase.path)
        testCase.verify(err, result);
    });
});
