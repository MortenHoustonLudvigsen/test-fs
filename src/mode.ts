import constants from './constants';

export function modeNum(mode: number | string | undefined, def?: number): number | undefined {
    if (typeof mode === 'number') {
        return mode & constants.MODE_MASK;
    } else if (typeof mode === 'string') {
        return parseInt(mode, 8);
    } else if (def) {
        return modeNum(def);
    }
    return undefined;
}
