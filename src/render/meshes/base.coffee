Renderable = require '../renderable'

class Base extends Renderable
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options
    @zUnits = options.zUnits ? 0

  _raw: (object) ->
    object.rotationAutoUpdate = false
    object.frustumCulled      = false
    object.matrixAutoUpdate   = false

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
    null

  hide: () ->
    for object in @objects
      object.visible = false
    null

module.exports = Base