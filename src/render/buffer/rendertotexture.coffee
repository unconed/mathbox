Renderable = require('../renderable')
RenderTarget = require './texture/rendertarget'

###
Render-To-Texture
###
class RenderToTexture extends Renderable

  constructor: (renderer, shaders, options) ->
    @childScene = options.scene
    @inited = false

    super renderer, shaders
    @build options

  build: (options) ->
    @scene  = new THREE.Scene()
    @camera = new THREE.Camera()
    @childScene.inject @scene

    @target = new RenderTarget @gl, options.width, options.height, options.frames, options
    @target.warmup (target) => @renderer.setRenderTarget target
    @renderer.setRenderTarget null

  render: (camera = @camera) ->
    @renderer.render @scene, @camera, @target.write
    @target.cycle()

  read: (frame = 0) -> @target.reads[Math.abs(frame)]

  dispose: () ->
    @childScene.unject()
    @childScene = null
    @scene = @camera = null

module.exports = RenderToTexture