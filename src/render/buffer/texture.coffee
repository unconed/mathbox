class Texture
  constructor: (@gl, @width, @height, @channels) ->
    @n = @width * @height * @channels
    @build()

  build: () ->
    gl = @gl

    # Make GL texture
    @texture = gl.createTexture()
    @format  = [null, gl.LUMINANCE, gl.LUMINANCE_ALPHA, gl.RGB, gl.RGBA][@channels]
    @format3 = [null, THREE.LuminanceFormat, THREE.LuminanceAlphaFormat, THREE.RGBFormat, THREE.RGBAFormat][@channels]

    gl.bindTexture   gl.TEXTURE_2D, @texture
    gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE
    gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE
    gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST
    gl.texParameteri gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST

    # Attach empty data
    @data = new Float32Array @n
    gl.pixelStorei gl.UNPACK_ALIGNMENT, 1
    gl.texImage2D  gl.TEXTURE_2D, 0, @format, @width, @height, 0, @format, gl.FLOAT, @data

    # Make wrapper texture object.
    @textureObject = new THREE.Texture(
      new Image(),
      new THREE.UVMapping(),
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      THREE.NearestFilter,
      THREE.NearestFilter)

    # Pre-init texture to trick WebGLRenderer
    @textureObject.__webglInit = true;
    @textureObject.__webglTexture = @texture;
    @textureObject.format = @format3
    @textureObject.type   = THREE.FloatType
    @textureObject.unpackAlignment = 1

    # Create uniforms
    @uniforms =
      dataResolution:
        type: 'v2'
        value: new THREE.Vector2 1 / @width, 1 / @height
      dataTexture:
        type: 't'
        value: @textureObject

  write: (data, x, y, w, h) ->
    gl = @gl;

    # Write to rectangle
    gl.bindTexture gl.TEXTURE_2D, @texture
    gl.pixelStorei gl.UNPACK_ALIGNMENT, 1
    gl.texSubImage2D gl.TEXTURE_2D, 0, x, y, w, h, @format, gl.FLOAT, data

  dispose: () ->
    throw 'Texture::dispose not yet implemented'

module.exports = Texture