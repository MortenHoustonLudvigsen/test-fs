import * as fs from 'fs';


declare module 'fs' {
    export namespace constants {
        export const S_ISUID: number;
        export const S_ISGID: number;
        export const S_ISVTX: number;
        export const MODE_MASK: number;
    }
}
const constants: typeof fs.constants = fs.constants || fs;

const S_ISUID = 0o0004000;
const S_ISGID = 0o0002000;
const S_ISVTX = 0o0001000;
const MODE_MASK = constants.S_IRWXU | constants.S_IRWXG | constants.S_IRWXG | S_ISUID | S_ISGID | S_ISVTX;

Object.assign(constants, {
    S_ISUID,
    S_ISGID,
    S_ISVTX,
    MODE_MASK
});

export default constants;
