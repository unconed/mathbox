Renderable = require '../renderable'

class Base extends Renderable
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options
    @zUnits = options.zUnits ? 0

  _raw: (object) ->
    object.rotationAutoUpdate = false
    object.frustumCulled      = false
    object.matrixAutoUpdate   = false

  depth: (write, test) ->
    for object in @objects
      m = object.material

      m.depthWrite = write
      m.depthTest  = test

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

  show: (transparent, blending, order) ->
    transparent = true if blending > THREE.NormalBlending

    z = if transparent then order else -order

    for object in @objects
      m = object.material

      object.renderDepth = z
      object.visible = true
      m.transparent  = transparent
      m.blending     = blending

    null

  hide: () ->
    for object in @objects
      object.visible = false
    null

module.exports = Base