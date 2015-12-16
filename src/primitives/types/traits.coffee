Types = require './types'

Traits =
  node:
    id:                Types.nullable(Types.string())
    classes:           Types.classes()

  entity:
    active:            Types.bool(true)

  object:
    visible:           Types.bool(true)

  unit:
    scale:             Types.nullable(Types.number())
    fov:               Types.nullable(Types.number())
    focus:             Types.nullable(Types.number(1), true)

  span:
    range:             Types.nullable(Types.vec2(-1, 1))
  view:
    range:             Types.array(Types.vec2(-1, 1), 4)
  view3:
    position:          Types.vec3()
    quaternion:        Types.quat()
    rotation:          Types.vec3()
    scale:             Types.vec3(1, 1, 1)
    eulerOrder:        Types.swizzle('xyz')
  view4:
    position:          Types.vec4()
    scale:             Types.vec4(1, 1, 1, 1)

  layer:
    depth:             Types.number(1)
    fit:               Types.fit('y')

  vertex:
    pass:              Types.vertexPass()
  fragment:
    pass:              Types.fragmentPass()
    gamma:             Types.bool(false)

  transform3:
    position:          Types.vec3()
    quaternion:        Types.quat()
    rotation:          Types.vec3()
    eulerOrder:        Types.swizzle('xyz')
    scale:             Types.vec3(1, 1, 1)
    matrix:            Types.mat4(1, 0, 0, 0,
                                  0, 1, 0, 0,
                                  0, 0, 1, 0,
                                  0, 0, 0, 1)
  transform4:
    position:          Types.vec4()
    scale:             Types.vec4(1, 1, 1, 1)
    matrix:            Types.mat4(1, 0, 0, 0,
                                  0, 1, 0, 0,
                                  0, 0, 1, 0,
                                  0, 0, 0, 1)

  camera:
    proxy:             Types.bool(false)
    position:          Types.nullable(Types.vec3())
    quaternion:        Types.nullable(Types.quat())
    rotation:          Types.nullable(Types.vec3())
    lookAt:            Types.nullable(Types.vec3())
    up:                Types.nullable(Types.vec3())
    eulerOrder:        Types.swizzle('xyz')
    fov:               Types.nullable(Types.number(1))
    #ortho:             Types.nullable(Types.number(0))

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

  origin:
    origin:            Types.vec4()
  scale:
    divide:            Types.number(10)
    unit:              Types.number(1)
    base:              Types.number(10)
    mode:              Types.scale()
    start:             Types.bool(true)
    end:               Types.bool(true)
    zero:              Types.bool(true)
    factor:            Types.positive(Types.number(1))
    nice:              Types.bool(true)
  grid:
    lineX:             Types.bool(true)
    lineY:             Types.bool(true)
    crossed:           Types.bool(false)
    closedX:           Types.bool(false)
    closedY:           Types.bool(false)
  axis:
    detail:            Types.int(1)
    crossed:           Types.bool(false)

  data:
    data:              Types.nullable(Types.data())
    expr:              Types.nullable(Types.emitter())
    bind:              Types.nullable(Types.func())
    live:              Types.bool(true)
  buffer:
    channels:          Types.enum(4, [1, 2, 3, 4])
    items:             Types.int(1)
    fps:               Types.nullable(Types.int(60))
    hurry:             Types.int(5)
    limit:             Types.int(60)
    realtime:          Types.bool(false)
    observe:           Types.bool(false)
    aligned:           Types.bool(false)
  sampler:
    centered:          Types.bool(false)
    padding:           Types.number(0)
  array:
    width:             Types.nullable(Types.positive(Types.int(1), true))
    bufferWidth:       Types.int(1)
    history:           Types.int(1)
  matrix:
    width:             Types.nullable(Types.positive(Types.int(1), true))
    height:            Types.nullable(Types.positive(Types.int(1), true))
    history:           Types.int(1)
    bufferWidth:       Types.int(1)
    bufferHeight:      Types.int(1)
  voxel:
    width:             Types.nullable(Types.positive(Types.int(1), true))
    height:            Types.nullable(Types.positive(Types.int(1), true))
    depth:             Types.nullable(Types.positive(Types.int(1), true))
    bufferWidth:       Types.int(1)
    bufferHeight:      Types.int(1)
    bufferDepth:       Types.int(1)

  resolve:
    expr:              Types.nullable(Types.func())
    items:             Types.int(1)

  style:
    opacity:           Types.positive(Types.number(1))
    color:             Types.color()
    blending:          Types.blending()
    zWrite:            Types.bool(true)
    zTest:             Types.bool(true)
    zIndex:            Types.positive(Types.round())
    zBias:             Types.number(0)
    zOrder:            Types.nullable(Types.int())

  geometry:
    points:            Types.select()
    colors:            Types.nullable(Types.select())

  point:
    size:              Types.positive(Types.number(4))
    sizes:             Types.nullable(Types.select())

    shape:             Types.shape()
    optical:           Types.bool(true)
    fill:              Types.bool(true)
    depth:             Types.number(1)

  line:
    width:             Types.positive(Types.number(2))
    depth:             Types.positive(Types.number(1))
    join:              Types.join()
    stroke:            Types.stroke()
    proximity:         Types.nullable(Types.number(Infinity))
    closed:            Types.bool(false)
  mesh:
    fill:              Types.bool(true)
    shaded:            Types.bool(false)
    map:               Types.nullable(Types.select())
    lineBias:          Types.number(5)
  strip:
    line:              Types.bool(false)
  face:
    line:              Types.bool(false)
  arrow:
    size:              Types.number(3)
    start:             Types.bool(false)
    end:               Types.bool(false)
  ticks:
    normal:            Types.vec3(0, 0, 1)
    size:              Types.positive(Types.number(10))
    epsilon:           Types.positive(Types.number(0.001))
  attach:
    offset:            Types.vec2(0, -20)
    snap:              Types.bool(false)
    depth:             Types.number(0)

  format:
    digits:            Types.nullable(Types.positive(Types.number(3)))
    data:              Types.nullable(Types.data())
    expr:              Types.nullable(Types.func())
    live:              Types.bool(true)
  font:
    font:              Types.font('sans-serif')
    style:             Types.string()
    variant:           Types.string()
    weight:            Types.string()
    detail:            Types.number(24)
    sdf:               Types.number(5)
  label:
    text:              Types.select()
    size:              Types.number(16)
    outline:           Types.number(2)
    expand:            Types.number(0)
    background:        Types.color(1, 1, 1)

  overlay:
    opacity:           Types.number(1)
    zIndex:            Types.positive(Types.round(0))
  dom:
    points:            Types.select()
    html:              Types.select()
    size:              Types.number(16)
    outline:           Types.number(2)
    zoom:              Types.number(1)
    color:             Types.nullable(Types.color())
    attributes:        Types.nullable(Types.object())
    pointerEvents:     Types.bool(false)

  texture:
    minFilter:         Types.filter('nearest')
    magFilter:         Types.filter('nearest')
    type:              Types.type('float')

  shader:
    sources:           Types.nullable(Types.select())
    language:          Types.string('glsl')
    code:              Types.string()
    uniforms:          Types.nullable(Types.object())
  include:
    shader:            Types.select()

  operator:
    source:            Types.select()
  spread:
    unit:              Types.mapping()
    items:             Types.nullable(Types.vec4())
    width:             Types.nullable(Types.vec4())
    height:            Types.nullable(Types.vec4())
    depth:             Types.nullable(Types.vec4())
    alignItems:        Types.anchor()
    alignWidth:        Types.anchor()
    alignHeight:       Types.anchor()
    alignDepth:        Types.anchor()
  grow:
    scale:             Types.number(1)
    items:             Types.nullable(Types.anchor())
    width:             Types.nullable(Types.anchor())
    height:            Types.nullable(Types.anchor())
    depth:             Types.nullable(Types.anchor())
  split:
    order:             Types.transpose('wxyz')
    axis:              Types.nullable(Types.axis())
    length:            Types.int(1)
    overlap:           Types.int(0)
  join:
    order:             Types.transpose('wxyz')
    axis:              Types.nullable(Types.axis())
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
  slice:
    items:             Types.nullable(Types.vec2())
    width:             Types.nullable(Types.vec2())
    height:            Types.nullable(Types.vec2())
    depth:             Types.nullable(Types.vec2())
  lerp:
    size:              Types.mapping('absolute')
    items:             Types.nullable(Types.number())
    width:             Types.nullable(Types.number())
    height:            Types.nullable(Types.number())
    depth:             Types.nullable(Types.number())
  subdivide:
    items:             Types.nullable(Types.positive(Types.int(), true))
    width:             Types.nullable(Types.positive(Types.int(), true))
    height:            Types.nullable(Types.positive(Types.int(), true))
    depth:             Types.nullable(Types.positive(Types.int(), true))
    bevel:             Types.number(1)
    lerp:              Types.bool(true)
  resample:
    indices:           Types.number(4)
    channels:          Types.number(4)
    sample:            Types.mapping()
    size:              Types.mapping('absolute')
    items:             Types.nullable(Types.number())
    width:             Types.nullable(Types.number())
    height:            Types.nullable(Types.number())
    depth:             Types.nullable(Types.number())
  readback:
    type:              Types.type('float')
    expr:              Types.nullable(Types.func())
    data:              Types.data()
    channels:          Types.enum(4, [1, 2, 3, 4])
    items:             Types.nullable(Types.int())
    width:             Types.nullable(Types.int())
    height:            Types.nullable(Types.int())
    depth:             Types.nullable(Types.int())
  root:
    speed:             Types.number(1)
    camera:            Types.select('[camera]')
  inherit:
    source:            Types.select()
    traits:            Types.array(Types.string())

  rtt:
    size:              Types.mapping('absolute')
    width:             Types.nullable(Types.number())
    height:            Types.nullable(Types.number())
    history:           Types.int(1)
  compose:
    alpha:             Types.bool(false)

  present:
    index:             Types.int(1)
    directed:          Types.bool(true)
    length:            Types.number(0)
  slide:
    order:             Types.nullable(Types.int(0))
    steps:             Types.number(1)
    early:             Types.int(0)
    late:              Types.int(0)
    from:              Types.nullable(Types.int(0))
    to:                Types.nullable(Types.int(1))

  transition:
    stagger:           Types.vec4()
    enter:             Types.nullable(Types.number(1))
    exit:              Types.nullable(Types.number(1))
    delay:             Types.number(0)
    delayEnter:        Types.nullable(Types.number(0))
    delayExit:         Types.nullable(Types.number(0))
    duration:          Types.number(.3)
    durationEnter:     Types.nullable(Types.number(0))
    durationExit:      Types.nullable(Types.number(0))
  move:
    from:              Types.vec4()
    to:                Types.vec4()

  seek:
    seek:              Types.nullable(Types.number(0))
  track:
    target:            Types.select()
    script:            Types.object({})
    ease:              Types.ease('cosine')
  trigger:
    trigger:           Types.nullable(Types.int(1), true)
  step:
    playback:          Types.ease('linear')
    stops:             Types.nullable(Types.array(Types.number()))
    delay:             Types.number(0)
    duration:          Types.number(.3)
    pace:              Types.number(0)
    speed:             Types.number(1)
    rewind:            Types.number(2)
    skip:              Types.bool(true)
    realtime:          Types.bool(false)
  play:
    delay:             Types.number(0)
    pace:              Types.number(1)
    speed:             Types.number(1)
    from:              Types.number(0)
    to:                Types.number(Infinity)
    realtime:          Types.bool(false)
    loop:              Types.bool(false)
  now:
    now:               Types.nullable(Types.timestamp())
    seek:              Types.nullable(Types.number(0))
    pace:              Types.number(1)
    speed:             Types.number(1)

module.exports = Traits