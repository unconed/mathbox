Renderable   = require '../renderable'
RenderTarget = require './texture/rendertarget'
Util         = require '../../util'

###
# Render-To-Texture with history
###
class RenderToTexture extends Renderable

  constructor: (renderer, shaders, options) ->
    @scene  = options.scene  ? new THREE.Scene()
    @camera = options.camera

    super renderer, shaders
    @build options

  shaderRelative: (shader) ->
    shader ?= @shaders.shader()
    shader.pipe "sample.2d", @uniforms

  shaderAbsolute: (shader, frames = 1, indices = 4) ->
    shader ?= @shaders.shader()
    if frames <= 1
      shader.pipe Util.GLSL.truncateVec(indices, 2) if indices > 2
      shader.pipe "map.2d.data",   @uniforms
      shader.pipe "sample.2d",     @uniforms

    else
      sample2DArray = Util.GLSL.sample2DArray Math.min frames, @target.frames
      shader.pipe Util.GLSL.extendVec(indices, 4) if indices < 4
      shader.pipe "map.xyzw.2dv"
      shader.split()
      shader  .pipe "map.2d.data", @uniforms
      shader.pass()
      shader.pipe sample2DArray,   @uniforms

  build: (options) ->
    if !@camera
      @camera = new THREE.PerspectiveCamera()
      @camera.position.set 0, 0, 3
      @camera.lookAt new THREE.Vector3()
    @scene.inject?()

    @target = new RenderTarget @gl, options.width, options.height, options.frames, options
    @target.warmup (target) => @renderer.setRenderTarget target
    @renderer.setRenderTarget null

    @_adopt @target.uniforms
    @_adopt
      dataPointer:
        type: 'v2'
        value: new THREE.Vector2(.5, .5)

    @filled = 0

  adopt:   (renderable) -> @scene.add    object for object in renderable.renders
  unadopt: (renderable) -> @scene.remove object for object in renderable.renders

  render: (camera = @camera) ->
    @renderer.render @scene.scene ? @scene, camera, @target.write
    @target.cycle()
    @filled++ if @filled < @target.frames

  read: (frame = 0) -> @target.reads[Math.abs(frame)]

  getFrames: () -> @target.frames

  getFilled: () -> @filled

  dispose: () ->
    @scene.unject?()
    @scene = @camera = null

    @target.dispose()

    super

module.exports = RenderToTexture