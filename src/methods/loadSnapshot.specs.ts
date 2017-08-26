import { Snapshot } from 'test-fs';
import { testPaths, createFs } from '../test';
import { resolve as resolvePath } from 'path';

it('loadSnapshot() should load a snapshot', function () {
    const data: Snapshot = {
        "dummy1.txt": "This is a dummy file",
        "dummy2.txt": "This is also a dummy file",
        "dummy/dummy3.txt": "This is a nested dummy file",
        "dummy/dummy4.txt": [255, 254, 253, 42, 43, 44]
    };
    const fs = createFs();
    fs.loadSnapshot(testPaths.physicalDir, data);
    for (const path of Object.keys(data)) {
        const expected = new Buffer(<any>data[path]);
        expect(fs.readFileSync(resolvePath(testPaths.physicalDir, path))).toEqual(expected);
    }
});
