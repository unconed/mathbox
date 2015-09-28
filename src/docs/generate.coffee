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

for type, def of defs
  [module, description] = PrimitiveDefs[type]

  out = """
  #### `#{module}/#{type}`

  *#{description}*

  """

  props = Object.keys def
  props.sort()

  for key in props
    prop = def[key]
    out += " * *#{key}* = #{prop[2]} (#{prop[1]}) - #{prop[0]}\n"

  docs[type] = out

types = Object.keys docs
types.sort()
for type in types
  console.log docs[type] 