require '../node'

TraitDefs     = require './traits'
PrimitiveDefs = require './primitives'

Primitives = require '..//primitives'

defs = {}

titleCase = (v) -> v.slice(0, 1).toUpperCase() + v.slice(1)

for type, klass of Primitives.Types.Classes
  def = defs[type] = {}
  for trait in klass.traits
    [trait, ns] = trait.split ':'
    suffix = if ns? then titleCase ns else ''
    def[k + suffix] = v for k, v of TraitDefs[trait] when TraitDefs[trait]?

docs = {}
index = {}

for type, def of defs
  [module, description, examples, defaults] = PrimitiveDefs[type]

  id = "#{module}/#{type}"

  out = """
  ####  <a name="#{id}"></a>`#{id}`

  *#{description}*


  """

  index[module] ?= []
  index[module].push " * [#{type}](##{id}) - #{description}"

  props = Object.keys def
  props.sort()

  for key in props
    prop = def[key]

    ex = examples?[key] ? prop[3]
    ex = if ex then ", e.g. `#{ex}`" else ""

    val = defaults?[key] ? prop[2]

    out += " * *#{key}* = `#{val}` (#{prop[1]}) - #{prop[0]}#{ex}\n"

  docs[type] = out

console.log "## List of MathBox Primitives\n\n*Grouped by module.*\n"

types = Object.keys docs
types.sort()

modules = Object.keys index
modules.sort()

for module in modules
  console.log "#### #{module}\n\n"
  console.log index[module].join "\n"
  console.log "\n"

console.log "\n\n---\n\n### Reference\n\n"

for type in types
  console.log docs[type] 