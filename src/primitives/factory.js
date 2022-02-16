// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

export class PrimitiveFactory {
  constructor(definitions, context) {
    this.context = context;
    this.classes = definitions.Classes;
    this.helpers = definitions.Helpers;
  }

  getTypes() {
    return Object.keys(this.classes);
  }

  make(type, options, binds = null) {
    if (options == null) {
      options = {};
    }

    const klass = this.classes[type];

    if (klass == null) {
      throw new Error(`Unknown primitive class \`${type}\``);
    }

    const node = new klass.model(
      type,
      klass.defaults,
      options,
      binds,
      klass,
      this.context.attributes
    );

    // NOTE: keep for side effects.
    new klass(node, this.context, this.helpers);
    return node;
  }
}
