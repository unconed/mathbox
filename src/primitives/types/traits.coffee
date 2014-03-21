Types = require './types'

Traits =
  node:
    id:          Types.nullable(Types.string())
    classes:     Types.array(Types.string())
  object:
    position:    Types.vec4()
    rotation:    Types.quat()
    scale:       Types.vec4(1, 1, 1, 1)
    visible:     Types.bool(true)
  style:
    opacity:     Types.number(1)
    color:       Types.color()
  bind:
    position:    Types.nullable(Types.object())
    color:       Types.nullable(Types.object())
  line:
    width:       Types.number(.01)
  view:
    dimensions:  Types.number(3)
    range:       Types.array(Types.vec2(-1, 1), 4)
  span:
    inherit:     Types.bool(true)
    range:       Types.vec2(-1, 1)
  grid:
    axes:        Types.vec2(1, 2)
    first:       Types.bool(true)
    second:      Types.bool(true)
  axis:
    detail:      Types.number(1)
    dimension:   Types.number(1)
  scale:
    divide:      Types.number(10)
    unit:        Types.number(1)
    base:        Types.number(10)
    mode:        Types.scale()
  ticks:
    size:        Types.number(.05)
    dimension:   Types.number(1)
  data:
    source:      Types.nullable(Types.object())
    expression:  Types.nullable(Types.func())
  array:
    length:      Types.number(1)
    history:     Types.number(1)
  matrix:
    width:       Types.number(1)
    height:      Types.number(1)
    history:     Types.number(1)

module.exports = Traits