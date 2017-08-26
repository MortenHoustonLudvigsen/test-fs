import { getErrorInfo } from './errors';
import { PathLike } from 'fs';

function getErrorMessage(errCode: string, operation?: string, pathOrFd?: PathLike | number): string {
    const err = getErrorInfo(errCode);
    let message = `${err.code}: ${err.description}`;
    if (operation || pathOrFd) {
        message += ',';
    }
    if (operation) {
        message += ` ${operation}`;
    }
    if (pathOrFd) {
        message += ` '${pathOrFd.toString()}'`;
    }
    return message;
}

export class TestFsError extends Error implements NodeJS.ErrnoException {
    constructor(errCode: string, operation?: string, pathOrFd?: PathLike | number) {
        super(getErrorMessage(errCode, operation, pathOrFd));
        const err = getErrorInfo(errCode);
        this.name = this.constructor.name;
        this.code = err.code;
        this.errno = err.errno;
        this.path = typeof pathOrFd === 'string' && pathOrFd || undefined;
        this.fd = typeof pathOrFd === 'number' && pathOrFd || undefined;
        this.operation = operation;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    readonly code: string;
    readonly errno: number;
    readonly path: string | undefined;
    readonly fd: number | undefined;
    readonly operation?: string;
}
