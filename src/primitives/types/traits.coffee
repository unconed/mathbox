Types = require('./types')

Traits =
  object:
    position:    Types.vec4()
    rotation:    Types.quat()
    scale:       Types.vec4(1, 1, 1, 1)
    visible:     Types.bool(true)
  style:
    opacity:     Types.number(1)
    color:       Types.color()
  data:
    position:    Types.object()
    color:       Types.object()
  line:
    width:       Types.number(.01)
  view:
    inherit:     Types.bool(false)
    range:       Types.array(Types.vec2(-1, 1), 4)
  axis:
    inherit:     Types.bool(true)
    range:       Types.vec2(-1, 1)
    dimension:   Types.number(1)
    detail:      Types.number(1)
  ticks:
    divide:      Types.number(10)
    unit:        Types.number(1)
    base:        Types.number(10)
    scale:       Types.scale()
    size:        Types.number(5)

module.exports = Traits