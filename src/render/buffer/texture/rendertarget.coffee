class RenderTarget
  constructor: (@gl, @width, @height, @frames, @options) ->
    @build()

    @width  = @width  || 1
    @height = @height || 1
    @frames = @frames || 0

    @targets = @virtual = null

  build: () ->
    gl = @gl

    make = () => new THREE.WebGLRenderTarget @width, @height, @options

    @targets = make() for i in [0..@frames]
    @virtual = make()

  dispose: () ->
    target.dispose() for target in @targets
    virtual.dispose()

module.exports = RenderTarget