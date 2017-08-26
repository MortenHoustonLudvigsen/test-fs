export function invariant(check: boolean, message: string, thing?: string) {
    if (!check) {
        throw new Error(`Invariant failed: ${message}${thing ? ` (${thing})` : ''}`);
    }
}

export function fileContents(contents: string | Buffer): string | Buffer {
    if (typeof contents === 'string') {
        return contents;
    }
    return isValidUTF8(contents) ? contents.toString('utf8') : contents;
}

function isValidUTF8(buf: Buffer): boolean {
    const len = buf.length;
    let i = 0;

    while (i < len) {
        if (buf[i] < 0x80) {  // 0xxxxxxx
            i++;
        } else if ((buf[i] & 0xe0) === 0xc0) {  // 110xxxxx 10xxxxxx
            if (
                i + 1 === len ||
                (buf[i + 1] & 0xc0) !== 0x80 ||
                (buf[i] & 0xfe) === 0xc0  // overlong
            ) {
                return false;
            } else {
                i += 2;
            }
        } else if ((buf[i] & 0xf0) === 0xe0) {  // 1110xxxx 10xxxxxx 10xxxxxx
            if (
                i + 2 >= len ||
                (buf[i + 1] & 0xc0) !== 0x80 ||
                (buf[i + 2] & 0xc0) !== 0x80 ||
                buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80 ||  // overlong
                buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0     // surrogate (U+D800 - U+DFFF)
            ) {
                return false;
            } else {
                i += 3;
            }
        } else if ((buf[i] & 0xf8) === 0xf0) {  // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
            if (
                i + 3 >= len ||
                (buf[i + 1] & 0xc0) !== 0x80 ||
                (buf[i + 2] & 0xc0) !== 0x80 ||
                (buf[i + 3] & 0xc0) !== 0x80 ||
                buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80 ||  // overlong
                buf[i] === 0xf4 && buf[i + 1] > 0x8f || buf[i] > 0xf4  // > U+10FFFF
            ) {
                return false;
            } else {
                i += 4;
            }
        } else {
            return false;
        }
    }

    return true;
}
