import { testPaths, call, promise } from '../test';
import { NotSupportedTestCase } from './test-cases';

const testCases = [
    new NotSupportedTestCase('accessSync', false, testPaths.physicalFile),
    new NotSupportedTestCase('access', true, testPaths.physicalFile),
    new NotSupportedTestCase('appendFileSync', false, testPaths.physicalFile, 'dummy'),
    new NotSupportedTestCase('appendFile', true, testPaths.physicalFile, 'dummy'),
    new NotSupportedTestCase('chownSync', false, testPaths.physicalFile, 42, 43),
    new NotSupportedTestCase('chown', true, testPaths.physicalFile, 42, 43),
    new NotSupportedTestCase('closeSync', false, 42),
    new NotSupportedTestCase('close', true, 42),
    new NotSupportedTestCase('createReadStream', false, testPaths.physicalFile),
    new NotSupportedTestCase('createWriteStream', false, testPaths.physicalFile),
    new NotSupportedTestCase('fchmodSync', false, 42, 42),
    new NotSupportedTestCase('fchmod', true, 42, 42),
    new NotSupportedTestCase('fchownSync', false, 42, 42, 43),
    new NotSupportedTestCase('fchown', true, 42, 42, 43),
    new NotSupportedTestCase('fdatasyncSync', false, 42),
    new NotSupportedTestCase('fdatasync', true, 42),
    new NotSupportedTestCase('fstatSync', false, 42),
    new NotSupportedTestCase('fstat', true, 42),
    new NotSupportedTestCase('fsyncSync', false, 42),
    new NotSupportedTestCase('fsync', true, 42),
    new NotSupportedTestCase('ftruncateSync', false, 42, 30),
    new NotSupportedTestCase('ftruncate', true, 42, 30),
    new NotSupportedTestCase('futimesSync', false, 42, 30, 31),
    new NotSupportedTestCase('futimes', true, 42, 30, 31),
    new NotSupportedTestCase('lchmodSync', false, testPaths.physicalFile, 42),
    new NotSupportedTestCase('lchmod', true, testPaths.physicalFile, 42),
    new NotSupportedTestCase('lchownSync', false, testPaths.physicalFile, 42, 43),
    new NotSupportedTestCase('lchown', true, testPaths.physicalFile, 42, 43),
    new NotSupportedTestCase('linkSync', false, testPaths.physicalFile, testPaths.virtualFile),
    new NotSupportedTestCase('link', true, testPaths.physicalFile, testPaths.virtualFile),
    new NotSupportedTestCase('lstatSync', false, testPaths.physicalFile),
    new NotSupportedTestCase('lstat', true, testPaths.physicalFile),
    new NotSupportedTestCase('mkdtempSync', false, testPaths.physicalDir),
    new NotSupportedTestCase('mkdtemp', true, testPaths.physicalDir),
    new NotSupportedTestCase('openSync', false, testPaths.physicalDir, 42),
    new NotSupportedTestCase('open', true, testPaths.physicalDir, 42),
    new NotSupportedTestCase('readSync', false, 42),
    new NotSupportedTestCase('read', true, 42),
    new NotSupportedTestCase('readlinkSync', false, testPaths.physicalFile),
    new NotSupportedTestCase('readlink', true, testPaths.physicalFile),
    new NotSupportedTestCase('realpathSync', false, testPaths.physicalFile),
    new NotSupportedTestCase('realpath', true, testPaths.physicalFile),
    new NotSupportedTestCase('renameSync', false, testPaths.physicalFile, testPaths.virtualFile),
    new NotSupportedTestCase('rename', true, testPaths.physicalFile, testPaths.virtualFile),
    new NotSupportedTestCase('symlinkSync', false, testPaths.physicalFile, testPaths.virtualFile),
    new NotSupportedTestCase('symlink', true, testPaths.physicalFile, testPaths.virtualFile),
    new NotSupportedTestCase('truncateSync', false, testPaths.physicalFile, 30),
    new NotSupportedTestCase('truncate', true, testPaths.physicalFile, 30),
    new NotSupportedTestCase('unwatchFile', false, testPaths.physicalFile, () => { }),
    new NotSupportedTestCase('utimesSync', false, testPaths.physicalFile, 30, 42),
    new NotSupportedTestCase('utimes', true, testPaths.physicalFile, 30, 42),
    new NotSupportedTestCase('watch', false, testPaths.physicalFile, () => { }),
    new NotSupportedTestCase('watchFile', false, testPaths.physicalFile, () => { }),
    new NotSupportedTestCase('writeSync', false, 42),
    new NotSupportedTestCase('write', true, 42),
];

testCases.forEach(testCase => {
    if (testCase.isAsync) {
        it(`${testCase.methodName}() ${testCase.title}`, async () => {
            const fs = testCase.init();
            const [err, result] = await promise(fs, <any>testCase.method, ...testCase.args);
            testCase.verify(err, result);
        });
    } else {
        it(`${testCase.methodName}() ${testCase.title}`, () => {
            const fs = testCase.init();
            const [err, result] = call(fs, <any>testCase.method, ...testCase.args);
            testCase.verify(err, result);
        });
    }
});
