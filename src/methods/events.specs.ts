import { Entry } from 'test-fs';
import { createFs, testPaths } from '../test';

it('should emit an "initialize" event for each item', () => {
    const entries: Entry[] = [];
    const fs = createFs(true, 8, 'initialize').on('initialize', entry => entries.push(entry));
    fs.writeFileSync(testPaths.physicalFile, 'This is a dummy file', 'utf8');
    expect(entries.length).toBeGreaterThan(0);
});

it('should emit a "load" event for each item loaded from the file system', () => {
    const entries: Entry[] = [];
    const fs = createFs(true, 8, 'load').on('load', entry => entries.push(entry));
    fs.writeFileSync(testPaths.physicalFile, 'This is a dummy file', 'utf8');
    expect(entries.length).toBeGreaterThan(0);
});
