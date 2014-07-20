###
Virtual RenderTarget that cycles through multiple frames
Provides easy access to past rendered frames
###
class RenderTarget
  constructor: (@gl, @width, @height, @frames, @textureOptions) ->
    @build()

    @width  = @width  || 1
    @height = @height || 1
    @frames = @frames || 1

    @build()

  build: () ->
    gl = @gl

    make = () => new THREE.WebGLRenderTarget @width, @height, @textureOptions

    @targets = (make() for i in [0..@frames])
    @reads   = (make() for i in [0..@frames])
    @write   = make()

    @index = 0

    # Texture access uniforms
    @uniforms =
      dataResolution:
        type: 'v2'
        value: new THREE.Vector2 1 / @width, 1 / @height
      dataTexture:
        type: 't'
        value: @reads[0]

  cycle: () ->
    keys = ['__webglTexture', '__webglFramebuffer', '__webglRenderbuffer']
    frames = @frames

    copy = (a, b) ->
      b[key] = a[key] for key in keys
      null
    add  = (i, j) -> (i + j + frames) % frames

    copy @write, @targets[@index]
    copy @targets[add @index, -i], read for read, i in @reads
    @index = add @index, 1
    copy @targets[@index], @write

  warmup: (callback) ->
    for i in [0..@frames]
      callback @write
      @cycle()

  dispose: () ->
    target.dispose() for target in @targets
    virtual.dispose()

module.exports = RenderTarget