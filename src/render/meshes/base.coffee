Renderable = require '../renderable'

class Base extends Renderable
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options
    @zUnits = options.zUnits ? 0
    @zOrder = 0

  _raw: (object) ->
    object.rotationAutoUpdate = false
    object.frustumCulled      = false
    object.matrixAutoUpdate   = false

  order: (order) ->
    if order
      z = order + if order > 0 then 100000 else -100000
    else
      z = null

    for object in @objects
      d = if object.material.transparent then -z else z
      object.renderDepth = d

    @zOrder = order

  depth: (write, test) ->
    for object in @objects
      m = object.material

      m.depthWrite = false
      m.depthTest  = false

  polygonOffset: (factor, units) ->
    units  -= @zUnits
    enabled = units != 0
    for object in @objects
      m = object.material

      m.polygonOffset         = enabled
      if enabled
        m.polygonOffsetFactor = factor
        m.polygonOffsetUnits  = units
    null

  show: (transparent, blending) ->
    transparent = true if blending > THREE.NormalBlending
    for object in @objects
      m = object.material

      object.visible = true
      m.transparent  = transparent
      m.blending     = blending

    @order @zOrder if @zOrder
    null

  hide: () ->
    for object in @objects
      object.visible = false
    null

module.exports = Base