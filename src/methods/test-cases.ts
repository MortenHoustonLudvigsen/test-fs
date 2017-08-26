import { TestFs, Entry } from 'test-fs';
import { createFs, autobind } from '../test';
import { invariant } from 'test-fs/utils';

export abstract class TestCaseBase {
    readonly event: string;
    readonly eventCount: number = 1;

    constructor(
        readonly expected: any,
        readonly name: string,
        pathOrFd: string | number,
        readonly _init: (fs: TestFs, path: string) => void = (() => { })
    ) {
        if (typeof pathOrFd === 'string') {
            this.path = pathOrFd;
        }
        if (typeof pathOrFd === 'number') {
            this.fd = pathOrFd;
        }
        autobind(this);
    }

    fs: TestFs;
    entries: Entry[] = [];
    readonly path: string;
    readonly fd: number;

    init(): TestFs {
        this.entries = [];
        this.fs = createFs(true, 8, this.event);
        if (this.path) {
            this._init(this.fs, this.path);
        }
        if (this.event) {
            this.fs.on(this.event, entry => this.entries.push(entry));
        }
        return this.fs;
    }

    getResult(result: any): any {
        return result;
    }

    verify(err?: any, result?: any) {
        if (this.expected instanceof RegExp) {
            expect(result).toBeUndefined();
            expect(err).not.toBeUndefined();
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toMatch(this.expected);
        } else {
            expect(err).toBeUndefined();
            this.verifyResult(this.getResult(result));
        }
    }

    abstract verifyResult(result: any): void;

    verifyEvents() {
        if (this.event) {
            if (this.expected instanceof RegExp) {
                expect(this.entries.length).toBe(0);
            } else {
                expect(this.entries.length).toBe(this.eventCount);
                expect(this.entries).toMatchSnapshot();
            }
        }
    }

    get expectedString(): string {
        return `return ${this.expected} for`;
    }

    get title(): string {
        if (this.expected instanceof RegExp) {
            return `should throw an ${this.expected.source} error for ${this.name}`;
        } else {
            return `should ${this.expectedString} ${this.name}`;
        }
    }

    get eventsTitle(): string {
        if (this.expected instanceof RegExp) {
            return `should not emit any '${this.event}' events for ${this.name}`;
        } else {
            const eventStr = this.eventCount === 1 ? `one '${this.event}' event` : `${this.eventCount} '${this.event}' events`;
            return `should emit ${eventStr} for ${this.name}`;
        }
    }
}

export class SnapshotTestCase extends TestCaseBase {
    constructor(
        readonly expected: 'snapshot' | RegExp,
        name: string,
        pathOrFd: string | number,
        _init: (fs: TestFs, path: string) => void = (() => { })
    ) {
        super(expected, name, pathOrFd, _init);
    }

    verifyResult(results: any) {
        expect(results).not.toBeUndefined();
        expect(results).toMatchSnapshot();
    }
}

export class ValueTestCase<TExpected> extends TestCaseBase {
    constructor(
        readonly expected: TExpected | RegExp,
        name: string,
        pathOrFd: string | number,
        _init: (fs: TestFs, path: string) => void = (() => { })
    ) {
        super(expected, name, pathOrFd, _init);
    }

    get expectedString(): string {
        return `return ${this.expected} for`;
    }

    verifyResult(results: any) {
        expect(results).toEqual(this.expected);
    }
}

export class NotSupportedTestCase extends TestCaseBase {
    readonly event = '';

    constructor(
        readonly methodName: string,
        readonly isAsync: boolean,
        pathOrFd: string | number,
        ...args: any[]
    ) {
        super(/ENOTSUP/, 'any entry', pathOrFd);
        this.method = (<any>TestFs.prototype)[methodName];
        this.args = [pathOrFd, ...args];
    }

    readonly method: Function;
    readonly args: any[];

    init(): TestFs {
        invariant(typeof this.method === 'function', `method must be a function`, this.methodName);
        return super.init();
    }

    verifyResult(results: any) {
        fail('Must throw ENOTSUP error');
    }

    verify(err?: any, result?: any) {
        expect(result).toBeUndefined();
        expect(err).not.toBeUndefined();
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toMatch(this.expected);
    }
}
