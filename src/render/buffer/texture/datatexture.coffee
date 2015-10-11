Util = require '../../../Util'

###
Manually allocated GL texture for data streaming.

Allows partial updates via subImage.
###
class DataTexture
  constructor: (@gl, @width, @height, @channels, options) ->
    @n = @width * @height * @channels

    gl = @gl
    minFilter = options.minFilter ? THREE.NearestFilter
    magFilter = options.magFilter ? THREE.NearestFilter
    type      = options.type      ? THREE.FloatType

    @minFilter = Util.Three.paramToGL gl, minFilter
    @magFilter = Util.Three.paramToGL gl, magFilter
    @type      = Util.Three.paramToGL gl, type
    @ctor      = Util.Three.paramToArrayStorage type

    @build options

  build: (options) ->
    gl = @gl

    # Make GL texture
    @texture = gl.createTexture()
    @format  = [null, gl.LUMINANCE, gl.LUMINANCE_ALPHA, gl.RGB, gl.RGBA][@channels]
    @format3 = [null, THREE.LuminanceFormat, THREE.LuminanceAlphaFormat, THREE.RGBFormat, THREE.RGBAFormat][@channels]

    gl.bindTexture   gl.TEXTURE_2D, @texture
    gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE
    gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE
    gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, @minFilter
    gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, @magFilter

    # Attach empty data
    @data = new @ctor @n
    gl.pixelStorei gl.UNPACK_ALIGNMENT, 1
    gl.texImage2D  gl.TEXTURE_2D, 0, @format, @width, @height, 0, @format, @type, @data

    # Make wrapper texture object.
    @textureObject = new THREE.Texture(
      new Image(),
      THREE.UVMapping,
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      options.minFilter,
      options.magFilter)

    # Pre-init texture to trick WebGLRenderer
    @textureObject.__webglInit     = true
    @textureObject.__webglTexture  = @texture
    @textureObject.format          = @format3
    @textureObject.type            = THREE.FloatType
    @textureObject.unpackAlignment = 1
    @textureObject.flipY           = false
    @textureObject.generateMipmaps = false

    # Create uniforms
    @uniforms =
      dataResolution:
        type: 'v2'
        value: new THREE.Vector2 1 / @width, 1 / @height
      dataTexture:
        type: 't'
        value: @textureObject

  write: (data, x, y, w, h) ->
    gl = @gl

    # Write to rectangle
    gl.bindTexture gl.TEXTURE_2D, @texture
    gl.pixelStorei gl.UNPACK_ALIGNMENT, 1
    gl.texSubImage2D gl.TEXTURE_2D, 0, x, y, w, h, @format, @type, data

  dispose: () ->
    @gl.deleteTexture @texture

    @textureObject.__webglInit    = false
    @textureObject.__webglTexture = null
    @textureObject = @texture = null

module.exports = DataTexture



