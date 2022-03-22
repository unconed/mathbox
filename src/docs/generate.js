// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as Primitives from '../primitives'
import PrimitiveDefs from './primitives.js'
import TraitDefs from './traits.js'

let def, _module, type;

const defs = {};

const titleCase = (v) => v.slice(0, 1).toUpperCase() + v.slice(1);

for (type in Primitives.Types.Classes) {
  const klass = Primitives.Types.Classes[type];
  def = defs[type] = {};
  for (let trait of Array.from(klass.traits)) {
    let ns;
    [trait, ns] = Array.from(trait.split(":"));
    const suffix = ns != null ? titleCase(ns) : "";
    for (const k in TraitDefs[trait]) {
      const v = TraitDefs[trait][k];
      if (TraitDefs[trait] != null) {
        def[k + suffix] = v;
      }
    }
  }
}

const docs = {};
const index = {};

for (type in defs) {
  let defaults, description, examples;
  def = defs[type];
  [_module, description, examples, defaults] = Array.from(PrimitiveDefs[type]);

  const id = `${_module}/${type}`;

  let out = `\
####  <a name="${id}"></a>\`${id}\`

*${description}*

\
`;

  if (index[_module] == null) {
    index[_module] = [];
  }
  index[_module].push(` * [${type}](#${id}) - ${description}`);

  const props = Object.keys(def);
  props.sort();

  for (const key of Array.from(props)) {
    const prop = def[key];

    let ex =
      (examples != null ? examples[key] : undefined) != null
        ? examples != null
          ? examples[key]
          : undefined
        : prop[3];
    ex = ex ? `, e.g. \`${ex}\`` : "";

    const val =
      (defaults != null ? defaults[key] : undefined) != null
        ? defaults != null
          ? defaults[key]
          : undefined
        : prop[2];

    out += ` * *${key}* = \`${val}\` (${prop[1]}) - ${prop[0]}${ex}\n`;
  }

  docs[type] = out;
}

console.log("## List of MathBox Primitives\n\n*Grouped by module.*\n");

const types = Object.keys(docs);
types.sort();

const modules = Object.keys(index);
modules.sort();

for (const m of modules) {
  console.log(`#### ${m}\n\n`);
  console.log(index[m].join("\n"));
  console.log("\n");
}

console.log("\n\n---\n\n### Reference\n\n");

for (type of types) {
  console.log(docs[type]);
}
