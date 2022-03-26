// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Merge multiple objects
export const merge = function () {
    const x = {};
    for (const obj of Array.from(arguments)) {
        for (const k in obj) {
            const v = obj[k];
            x[k] = v;
        }
    }
    return x;
};
export const clone = (o) => JSON.parse(JSON.serialize(o));
export const parseQuoted = function (str) {
    let accum = "";
    const unescape = (str) => (str = str.replace(/\\/g, ""));
    const munch = function (next) {
        if (accum.length) {
            list.push(unescape(accum));
        }
        return (accum = next != null ? next : "");
    };
    str = str.split(/(?=(?:\\.|["' ,]))/g);
    let quote = false;
    const list = [];
    for (const chunk of Array.from(str)) {
        const char = chunk[0];
        const token = chunk.slice(1);
        switch (char) {
            case '"':
            case "'":
                if (quote) {
                    if (quote === char) {
                        quote = false;
                        munch(token);
                    }
                    else {
                        accum += chunk;
                    }
                }
                else {
                    if (accum !== "") {
                        throw new Error(`ParseError: String \`${str}\` does not contain comma-separated quoted tokens.`);
                    }
                    quote = char;
                    accum += token;
                }
                break;
            case " ":
            case ",":
                if (!quote) {
                    munch(token);
                }
                else {
                    accum += chunk;
                }
                break;
            default:
                accum += chunk;
        }
    }
    munch();
    return list;
};
