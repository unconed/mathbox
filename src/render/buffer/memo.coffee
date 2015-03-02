Renderable      = require '../renderable'
RenderToTexture = require './rendertotexture'
Util            = require '../../util'

###
# Wrapped RTT for memoizing 4D arrays back to a 2D texture
###
class Memo extends RenderToTexture

  constructor: (renderer, shaders, options) ->

    @items    ?= options.items    || 1
    @channels ?= options.channels || 4
    @width    ?= options.width    || 1
    @height   ?= options.height   || 1
    @depth    ?= options.depth    || 1

    #options.format = [null, THREE.LuminanceFormat, THREE.LuminanceAlphaFormat, THREE.RGBFormat, THREE.RGBAFormat][@channels]
    options.format = THREE.RGBAFormat
    options.width  = @_width  = @items  * @width
    options.height = @_height = @height * @depth
    options.frames = 1

    delete options.items
    delete options.depth
    delete options.channels

    super renderer, shaders, options

    @_adopt
      textureItems:  { type: 'f', value: @items }
      textureHeight: { type: 'f', value: @height }

  shaderAbsolute: (shader) ->
    shader ?= @shaders.shader()
    shader.pipe 'map.xyzw.texture', @uniforms
    super shader, 1, 2
    #shader.pipe Util.GLSL.swizzleVec4 ['0000', 'x000', 'xw00', 'xyz0'][@channels] if @channels < 4

module.exports = Memo