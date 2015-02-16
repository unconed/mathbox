Types = require './types'

Traits =
  node:
    id:                Types.nullable(Types.string())
    classes:           Types.classes()

  entity:
    active:            Types.bool(true)

  object:
    visible:           Types.bool(true)

  style:
    opacity:           Types.number(1)
    color:             Types.color()
    blending:          Types.blending()
    zWrite:            Types.bool(true)
    zTest:             Types.bool(true)
    zIndex:            Types.number(0)
    zOrder:            Types.nullable(Types.int())
    zFactor:           Types.number(0)
    zUnits:            Types.number(0)

  overlay:
    opacity:           Types.number(1)
  html:
    element:           Types.select()
  label:
    indexing:          Types.indexing()
    offset:            Types.vec2(0, -20)
    snap:              Types.bool(true)
    source:            Types.select()
    data:              Types.nullable(Types.object())
    expression:        Types.nullable(Types.func())

  point:
    size:              Types.number(.01)
    shape:             Types.shape()
    fill:              Types.bool(true)
  line:
    width:             Types.number(.01)
    depth:             Types.number(1)
    stroke:            Types.stroke()
  mesh:
    solid:             Types.bool(true)
    shaded:            Types.bool(true)
  face:
    outline:           Types.bool(false)
  arrow:
    size:              Types.number(.07)
    start:             Types.bool(false)
    end:               Types.bool(false)
  ticks:
    size:              Types.number(.05)

  span:
    range:             Types.nullable(Types.vec2(-1, 1))
  view:
    range:             Types.array(Types.vec2(-1, 1), 4)
  view3:
    position:          Types.vec3()
    rotation:          Types.quat()
    scale:             Types.vec3(1, 1, 1)
  view4:
    position:          Types.vec4()
    scale:             Types.vec4(1, 1, 1, 1)

  vertex:
    pass:              Types.vertexPass()
    shader:            Types.nullable(Types.string())

  transform3:
    pass:              Types.vertexPass()
    position:          Types.vec3()
    rotation:          Types.quat()
    scale:             Types.vec3(1, 1, 1)
    matrix:            Types.mat4(1, 0, 0, 0,
                            0, 1, 0, 0,
                            0, 0, 1, 0,
                            0, 0, 0, 1)
  transform4:
    pass:              Types.vertexPass()
    position:          Types.vec4()
    scale:             Types.vec4(1, 1, 1, 1)
    matrix:            Types.mat4(1, 0, 0, 0,
                            0, 1, 0, 0,
                            0, 0, 1, 0,
                            0, 0, 0, 1)

  polar:
    bend:              Types.number(1)
    helix:             Types.number(0)
  spherical:
    bend:              Types.number(1)
  stereographic:
    bend:              Types.number(1)

  interval:
    axis:              Types.axis()
  area:
    axes:              Types.swizzle([1, 2], 2)
  volume:
    axes:              Types.swizzle([1, 2, 3], 3)

  scale:
    divide:            Types.number(10)
    unit:              Types.number(1)
    base:              Types.number(10)
    mode:              Types.scale()

  grid:
    first:             Types.bool(true)
    second:            Types.bool(true)
  axis:
    detail:            Types.int(1)

  geometry:
    points:            Types.select()
    colors:            Types.nullable(Types.select())

  source:
    hint:              Types.nullable(Types.string())

  data:
    data:              Types.nullable(Types.object())
    expression:        Types.nullable(Types.func())
    live:              Types.bool(true)
    dimensions:        Types.int(3)
    items:             Types.int(1)
  sampler:
    centered:          Types.bool(false)
  array:
    length:            Types.nullable(Types.int(1))
    history:           Types.int(1)
    bufferLength:      Types.int(1)
  matrix:
    width:             Types.nullable(Types.int(1))
    height:            Types.nullable(Types.int(1))
    history:           Types.int(1)
    bufferWidth:       Types.int(1)
    bufferHeight:      Types.int(1)
  voxel:
    width:             Types.nullable(Types.int(1))
    height:            Types.nullable(Types.int(1))
    depth:             Types.nullable(Types.int(1))
    bufferWidth:       Types.int(1)
    bufferHeight:      Types.int(1)
    bufferDepth:       Types.int(1)

  texture:
    minFilter:         Types.filter('nearest')
    magFilter:         Types.filter('nearest')
    type:              Types.type('float')

  operator:
    source:            Types.select()
  spread:
    items:             Types.nullable(Types.vec4())
    width:             Types.nullable(Types.vec4())
    height:            Types.nullable(Types.vec4())
    depth:             Types.nullable(Types.vec4())
    anchor:            Types.number(0)
  split:
    order:             Types.transpose('wxyz')
    axis:              Types.axis()
    length:            Types.int(1)
    overlap:           Types.int(0)
  join:
    order:             Types.transpose('wxyz')
    axis:              Types.axis()
    overlap:           Types.int(0)
  swizzle:
    order:             Types.swizzle()
  transpose:
    order:             Types.transpose()
  repeat:
    items:             Types.number(1)
    width:             Types.number(1)
    height:            Types.number(1)
    depth:             Types.number(1)
  lerp:
    items:             Types.nullable(Types.int())
    width:             Types.nullable(Types.int())
    height:            Types.nullable(Types.int())
    depth:             Types.nullable(Types.int())
  resample:
    indices:           Types.number(4)
    dimensions:        Types.number(4)
    map:               Types.mapping()
    scale:             Types.mapping('absolute')
    shader:            Types.nullable(Types.string())
    items:             Types.nullable(Types.int())
    width:             Types.nullable(Types.int())
    height:            Types.nullable(Types.int())
    depth:             Types.nullable(Types.int())

  root:
    camera:            Types.nullable(Types.select())

  rtt:
    width:             Types.nullable(Types.int())
    height:            Types.nullable(Types.int())
    history:           Types.int(1)
  compose:
    alpha:             Types.bool(false)

module.exports = Traits