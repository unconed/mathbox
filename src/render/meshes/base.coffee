Renderable = require '../renderable'

class Base extends Renderable
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options
    @zUnits = options.zUnits ? 0

  raw: () ->
    @_raw object for object in @objects
    null

  depth: (write, test) ->
    @_depth object, write, test for object in @objects
    null

  polygonOffset: (factor, units) ->
    @_polygonOffset object, factor, units for object in @objects
    null

  show: (transparent, blending, order) ->
    @_show object, transparent, blending, order for object in @objects

  hide: () ->
    @_hide object for object in @objects
    null

  _material: (options) ->
    material = new THREE.ShaderMaterial options
    material[key] = options[key] for key in ['vertexGraph', 'fragmentGraph']
    material

  _raw: (object) ->
    object.rotationAutoUpdate = false
    object.frustumCulled      = false
    object.matrixAutoUpdate   = false
    object.material.defaultAttributeValues = undefined

  _depth: (object, write, test) ->
    m = object.material
    m.depthWrite = write
    m.depthTest  = test

  _polygonOffset: (object, factor, units) ->
    units  -= @zUnits
    enabled = units != 0

    m = object.material

    m.polygonOffset         = enabled
    if enabled
      m.polygonOffsetFactor = factor
      m.polygonOffsetUnits  = units

  _show: (object, transparent, blending, order) ->
    # Force transparent to true to ensure all renderables drawn in order
    transparent = true

    # Beware front-to-back / back-to-front changes
    z = if transparent then order else -order

    m = object.material

    object.renderDepth = z
    object.visible = true
    m.transparent  = transparent
    m.blending     = blending

    null

  _hide: (object) ->
    object.visible = false

module.exports = Base