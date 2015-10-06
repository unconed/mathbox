require '../node'

TraitDefs     = require './traits'
PrimitiveDefs = require './primitives'

Primitives = require '..//primitives'

defs = {}

for type, klass of Primitives.Types.Classes
  def = defs[type] = {}
  for trait in klass.traits
    def[k] = v for k, v of TraitDefs[trait] when TraitDefs[trait]?

docs = {}
index = {}

for type, def of defs
  [module, description, examples] = PrimitiveDefs[type]

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

    ex = prop[3] ? examples?[key]
    ex = if ex then ", e.g. `#{ex}`" else ""

    out += " * *#{key}* = #{prop[2]} (#{prop[1]}) - #{prop[0]}#{ex}\n"

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