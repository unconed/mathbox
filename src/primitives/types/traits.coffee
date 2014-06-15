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

  point:
    size:        Types.number(.01)
  line:
    width:       Types.number(.01)
  mesh:
    solid:       Types.bool(true)
    shaded:      Types.bool(true)
  arrow:
    size:        Types.number(.07)
    start:       Types.bool(false)
    end:         Types.bool(false)
  ticks:
    size:        Types.number(.05)

  view:
    dimensions:  Types.int(3)
    range:       Types.array(Types.vec2(-1, 1), 4)
  span:
    range:       Types.nullable(Types.vec2(-1, 1))

  polar:
    bend:        Types.number(1)
    helix:       Types.number(0)

  spherical:
    bend:        Types.number(1)

  interval:
    axis:        Types.int(1)
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
    detail:      Types.int(1)

  geometry:
    points:      Types.select(Types.object())
    colors:      Types.select(Types.object())

  data:
    data:        Types.nullable(Types.object())
    expression:  Types.nullable(Types.func())
    source:      Types.nullable(Types.select(Types.object()))
    live:        Types.bool(true)
    dimensions:  Types.int(3)
    items:       Types.int(1)
  array:
    length:      Types.int(1)
    history:     Types.int(1)
  matrix:
    width:       Types.int(1)
    height:      Types.int(1)
    history:     Types.int(1)

  transform:
    source:      Types.select(Types.object())
  lerp:
    items:       Types.nullable(Types.number())
    width:       Types.nullable(Types.number())
    height:      Types.nullable(Types.number())
    depth:       Types.nullable(Types.number())
  spread:
    axis:        Types.int(1)
    vector:      Types.vec4(1, 0, 0, 0)
    anchor:      Types.number(0)
  swizzle:
    order:       Types.swizzle()
  transpose:
    order:       Types.transpose()
  repeat:
    items:       Types.number(1)
    width:       Types.number(1)
    height:      Types.number(1)
    depth:       Types.number(1)

module.exports = Traits