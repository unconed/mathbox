DataTexture = require './datatexture'

###
Wrapper around DataTexture that supports sizing beyond GL max texture sizes (in one dimension)
###
class VirtualTexture
  constructor: (@gl, @width, @height, @channels) ->
    @build()

  build: () ->
    gl = @gl
    w  = @width
    h  = @height

    max = gl.getParameter gl.MAX_TEXTURE_SIZE
    max2 = max * max

    n = w * h
    throw "Maximum texture area exceeded: #{w}x#{h} > #{max}x#{max}" if n > max2

    r = 1
    [r, w, h] = [r * 2, w / 2, h * 2] while w > max
    [r, w, h] = [r / 2, w * 2, h / 2] while h > max

    throw "Oversized texture must have width multiple of #{ratio}: #{@width}x#{@height}"    if w != Math.round w
    throw "Oversized texture must have height multiple of #{1/ratio}: #{@width}x#{@height}" if h != Math.round h

    @ratio   = r
    @texture = new DataTexture gl, w, h, @channels
    @uniforms = @texture.uniforms

  write: (data, x, y, w, h) ->
    return @texture.write data, x, y, w, h if @ratio == 1

    throw "Oversized textures not implemented yet."

  dispose: () ->
    return @texture.dispose()
    @texture = null

module.exports = DataTexture