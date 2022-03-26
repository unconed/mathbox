// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export class Guard {
    constructor(limit) {
        if (limit == null) {
            limit = 10;
        }
        this.limit = limit;
    }
    iterate(options) {
        const { step, last } = options;
        let { limit } = this;
        while (step()) {
            if (!--limit) {
                console.warn("Last iteration", typeof last === "function" ? last() : undefined);
                throw new Error("Exceeded iteration limit.");
            }
        }
        return null;
    }
}
