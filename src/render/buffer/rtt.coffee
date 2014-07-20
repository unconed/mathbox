Renderable = require('../renderable')
RenderTarget = require './texture/rendertarget'

###
Render-To-Texture
###
class RTT extends Renderable

  constructor: (gl, shaders, options) ->
    @childScene = options.scene

    super gl, shaders
    @build()

  build: () ->
    @scene  = new THREE.Scene()
    @childScene.inject @scene

  render: (renderer) ->
    renderer.render
