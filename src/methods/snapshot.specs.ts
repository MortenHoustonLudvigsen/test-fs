import { Snapshot } from 'test-fs';
import { testPaths, createFs } from '../test';
import { resolve as resolvePath, dirname } from 'path';

it('snapshot() should create a snapshot', function () {
    const data: Snapshot = {
        "dummy1.txt": "This is a dummy file",
        "dummy2.txt": "This is also a dummy file",
        "dummy/dummy3.txt": "This is a nested dummy file",
        "dummy/dummy4.txt": [255, 254, 253, 42, 43, 44]
    };
    const fs = createFs();
    for (const path of Object.keys(data)) {
        const fullPath = resolvePath(testPaths.physicalDir, path);
        fs.mkdirpSync(dirname(fullPath));
        fs.writeFileSync(fullPath, new Buffer(<any>data[path]));
    }
    const snapshot = fs.snapshot(testPaths.physicalDir);
    expect(snapshot).toMatchSnapshot();
});
