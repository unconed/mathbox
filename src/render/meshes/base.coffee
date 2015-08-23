Renderable = require '../renderable'
Util       = require '../../util'

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

    m = object.material

    object.renderOrder = -order
    object.visible = true
    m.transparent  = transparent
    m.blending     = blending

    null

  _hide: (object) ->
    object.visible = false

  _vertexColor: (shader, color, mask) ->
    v = shader

    if color
      v.require color
      v.pipe 'mesh.vertex.color', @uniforms

    if mask
      v.require mask
      v.pipe 'mesh.vertex.mask',  @uniforms

    return v

  _fragmentColor: (shader, hasStyle, shaded, color, mask) ->
    f = shader

    if hasStyle
      f.pipe 'style.color',             @uniforms if !shaded
      f.pipe 'style.color.shaded',      @uniforms if  shaded

    if color
      f.pipe 'mesh.fragment.color',     @uniforms
      f.pipe Util.GLSL.binaryOperator 'vec4', '*' if hasStyle

    if mask
      f.pipe 'mesh.fragment.mask',      @uniforms
      f.pipe Util.GLSL.binaryOperator 'vec4', '*' if hasStyle || color


module.exports = Base