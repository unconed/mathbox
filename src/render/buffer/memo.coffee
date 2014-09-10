Renderable   = require '../renderable'
RTT          = require './rendertotexture'
Screen       = rqeuire '../meshes/screen'
Util         = require '../../util'

###
Memoize data to a texture in GL
###
class Memo extends Renderable
  constructor: (renderer, shaders, options) ->
    super renderer, shaders

    @items     ?= options.items     || 1
    @channels  ?= options.channels  || 4
    @width     ?= options.width     || 1
    @height    ?= options.height    || 1
    @depth     ?= options.depth     || 1
    @minFilter ?= options.minFilter ? THREE.NearestFilter
    @magFilter ?= options.magFilter ? THREE.NearestFilter
    @type      ?= options.type      ? THREE.FloatType

    @build options

  shader: (shader) ->
    @rtt.shaderAbsolute shader

  build: (options) ->
    rttOptions =
      minFilter: @minFilter
      magFilter: @magFilter
      width:     width  = @width  * @items
      height:    height = @height * @depth
      type:      @type

    @_adopt
      remap2DScale: { type: 'v2', value: new THREE.Vector2 width, height }
      remapModulus: { type: 'v2', value: new THREE.Vector2 items, height }

    fragment = shaders.shader()
    fragment.pipe 'screen.remap.4d.xyzw', @uniforms
    fragment.pipe options.source

    @rtt    = new RTT renderer, shaders, rttOptions
    @screen = new Screen fragment: fragment

  update: () ->
    @rtt.render()

  dispose: () ->
    @rtt.dispose()
    super

module.exports = Memo