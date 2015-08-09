Util = require '../../../Util'
DataTexture = require './datatexture'

###
Manually allocated GL texture for data streaming, locally backed.

Allows partial updates via subImage.
Contains local copy of its data to allow quick resizing without gl.copyTexImage2d
(which requires render-to-framebuffer)
###
class BackedTexture extends DataTexture
  constructor: (gl, width, height, channels, options) ->
    super gl, width, height, channels, options
    @data     = new @ctor @n

  resize: (width, height) ->
    old       = @data
    oldWidth  = @width
    oldHeight = @height

    @width  = width
    @height = height
    @n      = width * height * @channels
    @data   = new @ctor @n

    gl = @gl
    gl.bindTexture gl.TEXTURE_2D, @texture
    gl.pixelStorei gl.UNPACK_ALIGNMENT, 1
    gl.texImage2D  gl.TEXTURE_2D, 0, @format, width, height, 0, @format, @type, @data

    @uniforms.dataResolution.value.set 1 / width, 1 / height

    @write old, 0, 0, oldWidth, oldHeight

  write: (src, x, y, w, h) ->
    width    = @width
    dst      = @data
    channels = @channels

    i = 0
    if width == w and x == 0
      j = y * w * channels
      n = w * h * channels
      dst[j++] = src[i++] while i < n
    else
      stride = width * channels
      ww = w * channels
      xx = x * channels
      yy = y
      yh = y + h
      while yy < yh
        k = 0
        j = xx + yy * stride
        dst[j++] = src[i++] while k++ < ww
        yy++

    super src, x, y, w, h

  dispose: () ->
    @data = null
    super

module.exports = BackedTexture

