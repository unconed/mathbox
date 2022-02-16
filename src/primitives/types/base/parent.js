// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Primitive } from "../../primitive.js";

export class Parent extends Primitive {
  static initClass() {
    this.model = Primitive.Group;
    this.traits = ["node"];
  }
}
Parent.initClass();
