Renderable = require '../renderable'
Util       = require '../../util'

class Base extends Renderable
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options
    @zUnits = options.zUnits ? 0

  raw: () ->
    @_raw object for object in @renders
    null

  depth: (write, test) ->
    @_depth object, write, test for object in @renders
    null

  polygonOffset: (factor, units) ->
    @_polygonOffset object, factor, units for object in @renders
    null

  show: (transparent, blending, order) ->
    @_show object, transparent, blending, order for object in @renders

  hide: () ->
    @_hide object for object in @renders
    null

  _material: (options) ->
    precision = @renderer.getPrecision()

    vertexPrefix = """
    precision #{precision} float;
    precision #{precision} int;
		uniform mat4 modelMatrix;
		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;
		uniform mat4 viewMatrix;
		uniform mat3 normalMatrix;
		uniform vec3 cameraPosition;
    """

    fragmentPrefix = """
    precision #{precision} float;
    precision #{precision} int;
		uniform mat4 viewMatrix;
		uniform vec3 cameraPosition;
    """

    material = new THREE.RawShaderMaterial options
    material[key] = options[key] for key in ['vertexGraph', 'fragmentGraph']
    material.vertexShader   = [vertexPrefix,   material.vertexShader  ].join '\n'
    material.fragmentShader = [fragmentPrefix, material.fragmentShader].join '\n'
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

  _vertexColor: (shader, color, mask, map) ->
    v = shader

    if color
      v.require color
      v.pipe 'mesh.vertex.color', @uniforms

    if mask
      v.require mask
      v.pipe 'mesh.vertex.mask',  @uniforms

    if map
      v.pipe 'mesh.vertex.map',   @uniforms

    return v

  _fragmentColor: (shader, hasStyle, shaded, color, mask, map) ->
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

    if map
      f.pipe 'mesh.fragment.map',       @uniforms
      f.pipe Util.GLSL.binaryOperator 'vec4', '*' if hasStyle || color || mask


module.exports = Base