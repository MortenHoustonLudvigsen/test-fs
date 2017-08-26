import { EntryMap, Entry, Stats } from './Entry';
import { EventEmitter } from 'events';
import { Action } from './Action';
import * as fs from 'fs';

export interface Event {
    event: string;
    entry: Stats;
}

export interface Snapshot {
    [path: string]: string | number[];
}

export type Callback<T> = (err?: Error, result?: T) => any;

export type Fs = typeof fs;
export interface TestFs extends Fs {
}

export class TestFs extends EventEmitter {
    version: number = 0;
    root: EntryMap = {};

    runAction<TResult>(action: Action<TResult>, time?: Date): TResult {
        const events: Event[] = [];

        const nextRoot = action
            .on('next', (event: string, entry: Entry) => events.push({ event, entry }))
            .reduce(this.root, time);

        if (nextRoot !== this.root) {
            this.version += 1;
            this.root = nextRoot;
        }

        for (const event of events) {
            this.emit('any', event.event, event.entry);
            this.emit(event.event, event.entry);
        }

        return action.result;
    }

    callAsync<T>(fn: (...args: any[]) => T, ...args: any[]): void {
        const callback: Callback<T> = args.pop();
        try {
            callback(undefined, fn.call(this, ...args));
        } catch (err) {
            callback(err);
        }
    }
}
