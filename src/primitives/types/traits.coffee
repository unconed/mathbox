Types = require('./types')

Traits =
  object:
    position:    Types.vec4()
    rotation:    Types.quat()
    scale:       Types.vec4(1, 1, 1, 1)
    visible:     Types.bool()
  style:
    opacity:     Types.number(1)
    color:       Types.color()
  data:
    position:    Types.object()
    color:       Types.object()
  line:
    width:       Types.number(1)
  view:
    range:       Types.array(Types.vec2(-1, 1), 4)
  grid:
    axes:        Types.vec2(1, 2)
  axis:
    inherit:     Types.bool(true)
    range:       Types.vec2(-1, 1)
    ticks:       Types.number(10)
    unit:        Types.number(1)
    base:        Types.number(10)
    detail:      Types.number(2)
    scale:       Types.scale()

module.exports = Traits