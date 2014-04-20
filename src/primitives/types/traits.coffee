Types = require './types'

Traits =
  node:
    type:        Types.string()
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
    zBias:       Types.number(0)

  line:
    width:       Types.number(.01)
  mesh:
    solid:       Types.bool(true)
    shaded:      Types.bool(true)
  arrow:
    size:        Types.number(.07)
    start:       Types.bool(false)
    end:         Types.bool(true)
    anchor:      Types.nullable(Types.number(0))
  ticks:
    size:        Types.number(.05)

  view:
    dimensions:  Types.number(3)
    range:       Types.array(Types.vec2(-1, 1), 4)
  span:
    range:       Types.nullable(Types.vec2(-1, 1))

  polar:
    bend:        Types.number(1)
    helix:       Types.number(0)

  interval:
    axis:        Types.number(1)
  area:
    axes:        Types.vec2(1, 2)

  scale:
    divide:      Types.number(10)
    unit:        Types.number(1)
    base:        Types.number(10)
    mode:        Types.scale()

  grid:
    first:       Types.bool(true)
    second:      Types.bool(true)
  axis:
    detail:      Types.number(1)

  vector:
    points:      Types.select(Types.object())
    colors:      Types.select(Types.object())
    detail:      Types.number(1)
  curve:
    points:      Types.select(Types.object())
    colors:      Types.select(Types.object())
  surface:
    points:      Types.select(Types.object())
    colors:      Types.select(Types.object())

  data:
    data:        Types.nullable(Types.object())
    expression:  Types.nullable(Types.func())
    live:        Types.bool(true)
    dimensions:  Types.number(3)
    items:       Types.number(1)
  array:
    length:      Types.number(1)
    history:     Types.number(1)
  matrix:
    width:       Types.number(1)
    height:      Types.number(1)
    history:     Types.number(1)

module.exports = Traits