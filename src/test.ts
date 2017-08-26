import { TestFs, Entry, isEntry } from 'test-fs';
import { resolve as resolvePath, relative as relativePath } from 'path';
import { inspect } from 'util';

const pkgDir: (cwd: string) => string = require('pkg-dir').sync;
export const rootDir = pkgDir(resolvePath(__dirname));
export const testFilesDir = resolvePath(rootDir, 'test-files');
export const testPaths = {
    physicalDir: testFilesDir,
    physicalFile: resolvePath(testFilesDir, 'file.txt'),
    physicalFile2: resolvePath(testFilesDir, 'file2.txt'),
    physicalBinaryFile: resolvePath(testFilesDir, 'file.bin'),
    emptyPhysicalDir: resolvePath(testFilesDir, 'emptydir'),
    virtualFileInPhysicalFile: resolvePath(testFilesDir, 'file.txt', 'dummy.txt'),
    virtualDir: resolvePath(testFilesDir, 'dummyDir'),
    virtualFile: resolvePath(testFilesDir, 'dummy.txt'),
    virtualFileInVirtualDir: resolvePath(testFilesDir, 'dummyDir/dummy.txt'),
    virtualDirInVirtualDir: resolvePath(testFilesDir, 'dummyDir/dummyDir2'),
}

function formatPath(path: string) {
    path = relativePath(rootDir, path).replace(/\\+/g, '/');
    if (path === '') {
        path = '.';
    }
    return path;
}

function serializeEntry(entry: Entry, indent: string, first: boolean): string[] {
    function getValue(key: string) {
        switch (key) {
            case 'path':
                return formatPath(entry.path);
            case 'dir':
                return typeof entry.dir === 'string' ? inspect(formatPath(entry.dir)) : undefined;
            case 'mode':
                return Number.isInteger(entry.mode!) ? `0o${entry.mode!.toString(8)}` : undefined;
            default:
                const value = (<any>entry)[key];
                return typeof value !== 'undefined' ? inspect(value) : value;
        }
    }

    function add(...keys: string[]) {
        for (let key of keys) {
            const value = getValue(key);
            if (typeof value === 'undefined') {
                return;
            }
            result.push(`${indent}    ${pad(key, 9, '.')}: ${value}`);
        }
    }

    const result: string[] = [];

    if (!first) {
        result.push('');
    }
    result.push(`${indent}<${getValue('path')}>`);
    add('name', 'dir', 'type', 'version', 'mode', 'statCount', 'readCount', 'size', 'virtual');

    switch (entry.type) {
        case 'initial':
            break;
        case 'directory':
            Object.keys(entry.entries).sort().forEach(name => {
                result.push(...serializeEntry(entry.entries[name], indent + '    ', false))
            });
            break;
        case 'file':
            add('contents');
            break;
        case 'none':
            break;
    }

    return result;
}

expect.addSnapshotSerializer({
    test: value => isEntry(value),
    print: (entry: Entry) => {
        return serializeEntry(entry, '', true).join('\n');
    }
});

expect.addSnapshotSerializer({
    test: value => Array.isArray(value) && value.every(v => typeof v === 'number'),
    print: (value: number[]) => {
        return JSON.stringify(value);
    }
});

const debugAllEvents = false;
const debugNoEvents = true;

function pad(str: string, length: number, char = ' ') {
    while (str.length < length) {
        str = str + char;
    }
    return str;
}

function entryType(entry: Entry) {
    switch (entry.type) {
        case 'initial':
            return 'initial';
        case 'directory':
            return entry.virtual ? 'virtual dir' : 'physical dir';
        case 'file':
            return entry.virtual ? 'virtual file' : 'physical file';
        case 'none':
            return entry.virtual ? 'virtual none' : 'physical none';
    }
}

export function formatStats(entry: Entry) {
    return `[v${entry.version} - ${entry.statCount} stats - ${entry.readCount} reads] ${pad(entryType(entry), 13)} ${entry.path}`;
}

export function createFs(debugEvents = debugAllEvents, indent: number = 0, ...events: string[]) {
    const fs = new TestFs();
    events = events.filter(e => !!e);
    if (!debugNoEvents && debugEvents) {
        fs.on('any', (event, entry) => {
            if (debugAllEvents || events.length === 0 || events.indexOf(event) >= 0) {
                console.log(`${pad('', indent)}Event: ${pad(event, 12)} ${formatStats(entry)}`);
            }
        });
    }
    return fs;
}

export type SimpleCallback<TResult> = (result?: TResult) => any;
export function simplePromise<TResult>(self: any, fn: (callback: SimpleCallback<TResult>) => any): Promise<[any, TResult | undefined]>;
export function simplePromise<TArg1, TResult>(self: any, fn: (arg1: TArg1, callback: SimpleCallback<TResult>) => any, arg1: TArg1): Promise<[any, TResult | undefined]>;
export function simplePromise<TArg1, TArg2, TResult>(self: any, fn: (arg1: TArg1, arg2: TArg2, callback: SimpleCallback<TResult>) => any, arg1: TArg1, arg2: TArg2): Promise<[any, TResult | undefined]>;
export function simplePromise<TResult>(self: any, fn: (...args: any[]) => any, ...args: any[]): Promise<[any, TResult | undefined]> {
    return new Promise((resolve, reject) => {
        fn.call(self, ...args, (result: TResult) => {
            resolve([undefined, result]);
        });
    });
}

export type Callback<TResult> = (err?: any, result?: TResult) => any;
export function promise<TResult>(self: any, fn: (callback: Callback<TResult>) => void | any): Promise<[any, TResult | undefined]>;
export function promise<TArg1, TResult>(self: any, fn: (arg1: TArg1, callback: Callback<TResult>) => void | any, arg1: TArg1): Promise<[any, TResult | undefined]>;
export function promise<TArg1, TArg2, TResult>(self: any, fn: (arg1: TArg1, arg2: TArg2, callback: Callback<TResult>) => void | any, arg1: TArg1, arg2: TArg2): Promise<[any, TResult | undefined]>;
export function promise<TResult>(self: any, fn: (...args: any[]) => any, ...args: any[]): Promise<[any, TResult | undefined]> {
    return new Promise((resolve, reject) => {
        fn.call(self, ...args, (err: any, result: TResult) => {
            resolve([err, result]);
        });
    });
}

export function call<TResult>(self: any, fn: () => TResult): [any, TResult | undefined];
export function call<TArg1, TResult>(self: any, fn: (arg1: TArg1) => TResult, arg1: TArg1): [any, TResult | undefined];
export function call<TArg1, TArg2, TResult>(self: any, fn: (arg1: TArg1, arg2: TArg2) => TResult, arg1: TArg1, arg2: TArg2): [any, TResult | undefined];
export function call<TResult>(self: any, fn: (...args: any[]) => any, ...args: any[]): [any, TResult | undefined] {
    try {
        const result = fn.call(self, ...args);
        return [undefined, result];
    } catch (err) {
        return [err, undefined];
    }
}

export function autobind<T extends object>(self: T): T {
    for (const key in self) {
        const value = (<any>self)[key];
        if (typeof value === 'function') {
            (<any>self)[key] = value.bind(self);
        }
    }
    return self;
}