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

  _vertexColor: (color, mask) ->
    return unless color or mask

    v = @shaders.shader()

    if color
      v.require color
      v.pipe 'mesh.vertex.color', @uniforms

    if mask
      v.require mask
      v.pipe 'mesh.vertex.mask',  @uniforms

    v

  _vertexPosition: (position, material, map, channels, stpq) ->
    v = @shaders.shader()

    if map or (material and material != true)
      defs = {}
      defs.POSITION_MAP = ''  if channels > 0 or stpq
      defs[['POSITION_U','POSITION_UV','POSITION_UVW','POSITION_UVWO'][channels - 1]] = '' if channels > 0
      defs.POSITION_STPQ = '' if stpq

    v.require position
    v.pipe 'mesh.vertex.position',      @uniforms, defs

  _fragmentColor: (hasStyle, material, color, mask, map, channels, stpq, combine, linear) ->
    f = @shaders.shader()

    # metacode is terrible
    join  = false
    gamma = false

    defs = {}
    defs[['POSITION_U','POSITION_UV','POSITION_UVW','POSITION_UVWO'][channels - 1]] = '' if channels > 0
    defs.POSITION_STPQ        = '' if stpq

    if hasStyle
      f.pipe 'style.color',             @uniforms
      join  = true

      if color or map or material
        f.pipe 'mesh.gamma.in'          if !linear or color
        gamma = true

    if color
      f.isolate()
      f.pipe 'mesh.fragment.color',     @uniforms
      f.pipe 'mesh.gamma.in'            if !linear or join
      f.end()
      f.pipe Util.GLSL.binaryOperator 'vec4', '*' if join

      f.pipe 'mesh.gamma.out'           if linear and join

      join = true
      gamma = true

    if map
      if !join and combine
        f.pipe Util.GLSL.constant 'vec4', 'vec4(1.0)'

      f.isolate()
      f.require map
      f.pipe 'mesh.fragment.map',       @uniforms, defs
      f.pipe 'mesh.gamma.in'            if !linear
      f.end()

      if combine
        f.pipe combine
      else
        f.pipe Util.GLSL.binaryOperator 'vec4', '*' if join

      join = true
      gamma = true

    if material
      f.pipe Util.GLSL.constant 'vec4', 'vec4(1.0)' if !join
      if material == true
        f.pipe 'mesh.fragment.shaded',  @uniforms
      else
        f.require material
        f.pipe 'mesh.fragment.material', @uniforms, defs

      gamma = true

    if gamma and !linear
      f.pipe 'mesh.gamma.out'

    if mask
      f.pipe 'mesh.fragment.mask',      @uniforms
      f.pipe Util.GLSL.binaryOperator 'vec4', '*' if join

    f

module.exports = Base