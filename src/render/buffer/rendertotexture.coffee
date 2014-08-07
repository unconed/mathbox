Renderable   = require '../renderable'
RenderTarget = require './texture/rendertarget'
Util         = require '../../util'

###
Render-To-Texture
###
class RenderToTexture extends Renderable

  constructor: (renderer, shaders, options) ->
    @scene  = options.scene ? new THREE.Scene()
    @inited = false

    super renderer, shaders
    @build options

  shaderRelative: (shader) ->
    shader.pipe "sample.2d", @uniforms

  shaderAbsolute: (shader, frames = 1, fragment) ->
    if frames == 1
      if fragment?
        shader.callback()
      shader.pipe "map.xyz.2d"
      shader.pipe "map.2d.data",   @uniforms
      shader.pipe "sample.2d",     @uniforms
      if fragment?
        shader.join()
        shader.pipe fragment

    else
      sample2DArray = Util.GLSL.sample2DArray Math.min frames, @target.frames

      if fragment?
        shader.callback()
      shader.pipe "map.xyz.2dv"
      shader.split()
      shader  .pipe "map.2d.data", @uniforms
      shader.pass()
      shader.pipe sample2DArray,   @uniforms
      if fragment?
        shader.join()
        shader.pipe fragment

  build: (options) ->
    @camera = new THREE.PerspectiveCamera()
    @camera.position.set 0, 0, 3
    @camera.lookAt new THREE.Vector3()
    @scene.inject()

    @target = new RenderTarget @gl, options.width, options.height, options.frames, options
    @target.warmup (target) => @renderer.setRenderTarget target
    @renderer.setRenderTarget null

    @_adopt @target.uniforms
    @_adopt
      dataPointer:
        type: 'v2'
        value: new THREE.Vector2(.5, .5)

    @filled = 0

  render: (camera = @camera) ->
    @renderer.render @scene.scene, @camera, @target.write
    @target.cycle()
    @filled++ if @filled < @target.frames

  read: (frame = 0) -> @target.reads[Math.abs(frame)]

  getFrames: () -> @target.frames

  getFilled: () -> @filled

  dispose: () ->
    @scene.unject()
    @scene = null
    @scene = @camera = null

module.exports = RenderToTexture