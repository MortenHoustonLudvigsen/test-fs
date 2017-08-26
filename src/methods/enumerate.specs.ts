import { testPaths, createFs } from '../test';

it('enumerate() should enumerate entries', function () {
    const fs = createFs();
    fs.writeFileSync(testPaths.virtualFile, 'This is a dummy file', 'utf8');
    const entries = fs.enumerate(entry => entry.isDirectory() || entry.isFile());
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some(e => e.path === testPaths.physicalDir)).toBe(true);
    expect(entries.some(e => e.path === testPaths.virtualFile)).toBe(true);
});
