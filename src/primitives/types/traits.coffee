Types = require './types'

Traits =
  node:
    type:        Types.string()
    id:          Types.nullable(Types.string())
    classes:     Types.classes()

  object:
    position:    Types.vec4()
    rotation:    Types.quat()
    scale:       Types.vec4(1, 1, 1, 1)
    visible:     Types.bool(true)

  style:
    opacity:     Types.number(1)
    color:       Types.color()
    blending:    Types.blending()
    zFactor:     Types.number(8)
    zUnits:      Types.number(0)
    zIndex:      Types.number(0)
    zOrder:      Types.nullable(Types.number())

  point:
    size:        Types.number(.01)
  line:
    width:       Types.number(.005)
    depth:       Types.number(.5)
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
    range:       Types.array(Types.vec2(-1, 1), 4)
  span:
    range:       Types.nullable(Types.vec2(-1, 1))

  project4:
    projection:  Types.mat4(1, 0, 0, .577,
                            0, 1, 0, .577,
                            0, 0, 1, .577,
                            0, 0, 0, 0)

  polar:
    bend:        Types.number(1)
    helix:       Types.number(0)
  spherical:
    bend:        Types.number(1)
  stereographic:
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

  source:
    hint:        Types.nullable(Types.string())

  data:
    data:        Types.nullable(Types.object())
    expression:  Types.nullable(Types.func())
    live:        Types.bool(true)
    dimensions:  Types.int(3)
    items:       Types.int(1)
  sampler:
    centered:    Types.bool(false)
  array:
    length:      Types.int(1)
    history:     Types.int(1)
  matrix:
    width:       Types.int(1)
    height:      Types.int(1)
    history:     Types.int(1)
  voxel:
    width:       Types.int(1)
    height:      Types.int(1)
    depth:       Types.int(1)

  texture:
    width:       Types.nullable(Types.int())
    height:      Types.nullable(Types.int())
  rtt:
    history:     Types.int(1)
    expose:      Types.int(1)

  operator:
    source:      Types.select(Types.object())
  lerp:
    items:       Types.nullable(Types.number())
    width:       Types.nullable(Types.number())
    height:      Types.nullable(Types.number())
    depth:       Types.nullable(Types.number())
  spread:
    items:       Types.nullable(Types.vec4())
    width:       Types.nullable(Types.vec4())
    height:      Types.nullable(Types.vec4())
    depth:       Types.nullable(Types.vec4())
    anchor:      Types.number(0)
  split:
    order:       Types.transpose()
    items:       Types.nullable(Types.number())
    width:       Types.nullable(Types.number())
    height:      Types.nullable(Types.number())
    depth:       Types.nullable(Types.number())
    overlap:     Types.int(0)
  join:
    order:       Types.transpose()
    items:       Types.nullable(Types.number())
    width:       Types.nullable(Types.number())
    height:      Types.nullable(Types.number())
    depth:       Types.nullable(Types.number())
    overlap:     Types.int(0)
  swizzle:
    order:       Types.swizzle()
  transpose:
    order:       Types.transpose()
  repeat:
    items:       Types.number(1)
    width:       Types.number(1)
    height:      Types.number(1)
    depth:       Types.number(1)

  root:
    camera:      Types.nullable(Types.select(Types.object()))

  compose:
    alpha:       Types.bool(false)
    depth:       Types.bool(false)
  frame:
    frame:       Types.number(0)

module.exports = Traits