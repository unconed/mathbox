Types = require './types'

Traits =
  node:
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
    zWrite:      Types.bool(true)
    zTest:       Types.bool(true)
    zFactor:     Types.number(0)
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
    axis:        Types.axis()
  area:
    axes:        Types.swizzle([1, 2], 2)
  volume:
    axes:        Types.swizzle([1, 2, 3], 3)

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
    points:      Types.select()
    colors:      Types.nullable(Types.select())

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
    length:      Types.nullable(Types.int(1))
    history:     Types.int(1)
  matrix:
    width:       Types.nullable(Types.int(1))
    height:      Types.nullable(Types.int(1))
    history:     Types.int(1)
  voxel:
    width:       Types.nullable(Types.int(1))
    height:      Types.nullable(Types.int(1))
    depth:       Types.nullable(Types.int(1))

  texture:
    minFilter:   Types.filter('linear')
    magFilter:   Types.filter('linear')
    type:        Types.type()

  operator:
    source:      Types.select()
  lerp:
    items:       Types.nullable(Types.int())
    width:       Types.nullable(Types.int())
    height:      Types.nullable(Types.int())
    depth:       Types.nullable(Types.int())
  spread:
    items:       Types.nullable(Types.vec4())
    width:       Types.nullable(Types.vec4())
    height:      Types.nullable(Types.vec4())
    depth:       Types.nullable(Types.vec4())
    anchor:      Types.number(0)
  split:
    order:       Types.transpose('wxyz')
    axis:        Types.axis()
    length:      Types.int(1)
    overlap:     Types.int(0)
  join:
    order:       Types.transpose('wxyz')
    axis:        Types.axis()
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

  remap:
    indices:     Types.number(4)
    dimensions:  Types.number(4)
    shader:      Types.nullable(Types.string())

  root:
    camera:      Types.nullable(Types.select())

  rtt:
    width:       Types.nullable(Types.int())
    height:      Types.nullable(Types.int())
    history:     Types.int(1)
  compose:
    alpha:       Types.bool(false)
    depth:       Types.bool(false)

module.exports = Traits