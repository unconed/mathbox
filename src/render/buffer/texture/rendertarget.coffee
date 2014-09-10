###
Virtual RenderTarget that cycles through multiple frames
Provides easy access to past rendered frames
@reads[] and @write contain THREE.WebGLRenderTargets whose internal pointers are rotated automatically
###
class RenderTarget
  constructor: (@gl, @width, @height, @frames, @textureOptions = {}) ->
    @textureOptions.minFilter ?= THREE.LinearFilter
    @textureOptions.magFilter ?= THREE.LinearFilter
    @textureOptions.format    ?= THREE.RGBAFormat
    @textureOptions.type      ?= THREE.UnsignedByteType

    @width  = @width  || 1
    @height = @height || 1
    @frames = @frames || 1

    @build()

  build: () ->

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
      dataTextures:
        type: 'tv'
        value: @reads

  cycle: () ->
    keys = ['__webglTexture', '__webglFramebuffer', '__webglRenderbuffer']
    frames = @frames

    copy = (a, b) ->
      b[key] = a[key] for key in keys
      null
    add  = (i, j) -> (i + j + frames * 2) % frames

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