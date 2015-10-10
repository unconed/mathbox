Renderable      = require '../renderable'
Buffer          = require './buffer'
Memo            = require './memo'
MemoScreen      = require '../meshes/memoscreen'
Util            = require '../../util'

###
# Readback up to 4D array of up to 4D data from GL
###
class Readback extends Renderable

  constructor: (renderer, shaders, options) ->
    @items    ?= options.items    || 1
    @channels ?= options.channels || 4
    @width    ?= options.width    || 1
    @height   ?= options.height   || 1
    @depth    ?= options.depth    || 1
    @type     ?= options.type     || THREE.FloatType
    @stpq     ?= options.stpq     || false
    @isFloat   = @type == THREE.FloatType

    @active = @sampled = @rect = @pad = null
    super renderer, shaders

    @build options

    ###
    # log precision
    gl = @gl
    for name, pass of {Vertex: gl.VERTEX_SHADER, Fragment: gl.FRAGMENT_SHADER}
      bits = for prec in [gl.LOW_FLOAT, gl.MEDIUM_FLOAT, gl.HIGH_FLOAT]
        gl.getShaderPrecisionFormat(pass, prec).precision
      console.log name, 'shader precision',  bits
    ###

  build: (options) ->
    map       = options.map
    indexer   = options.indexer
    isIndexed = indexer? and !indexer.empty()

    {items, width, height, depth, stpq} = @

    sampler = map
    if isIndexed
      # Preserve original xyzw offset of datapoint to tie it back to the source

      # Modulus to pack xyzw into a single integer index
      @_adopt indexModulus: { type: 'v4', value: new THREE.Vector4 items, items * width, items * width * height, 1 }

      # Build shader to pack XYZ + index into a single RGBA
      sampler = @shaders.shader()
      sampler.require map
      sampler.require indexer
      #sampler.require Util.GLSL.identity 'vec4'
      sampler.pipe 'float.index.pack', @uniforms

    if @isFloat && @channels > 1
      # Memoize multi-channel float data into float buffer first
      @floatMemo = new Memo @renderer, @shaders,
        items:     items
        channels:  4 # non-RGBA render target not supported
        width:     width
        height:    height
        depth:     depth
        history:   0
        type:      THREE.FloatType

      @floatCompose = new MemoScreen @renderer, @shaders,
        map:      sampler
        items:    items
        width:    width
        height:   height
        depth:    depth
        stpq:     stpq

      @floatMemo.adopt @floatCompose

      # Second pass won't need texture coordinates
      stpq = false

      # Replace sampler with memoized sampler
      sampler = @shaders.shader()
      @floatMemo.shaderAbsolute sampler

    if @isFloat
      # Encode float data into byte buffer
      stretch  = @channels
      channels = 4 # one 32-bit float per pixel
    else
      # Render byte data directly
      stretch  = 1
      channels = @channels

    if stretch > 1
      # Stretch horizontally, sampling once per channel
      encoder = @shaders.shader()
      encoder.pipe Util.GLSL.mapByte2FloatOffset stretch
      encoder.require sampler
      encoder.pipe 'float.stretch'
      encoder.pipe 'float.encode'
      sampler = encoder

    else if @isFloat
      # Direct sampling
      encoder = @shaders.shader()
      encoder.pipe sampler
      encoder.pipe Util.GLSL.truncateVec4 4, 1
      encoder.pipe 'float.encode'
      sampler = encoder

    # Memoize byte data
    @byteMemo = new Memo @renderer, @shaders,
      items:     items * stretch
      channels:  4 # non-RGBA render target not supported
      width:     width
      height:    height
      depth:     depth
      history:   0
      type:      THREE.UnsignedByteType

    @byteCompose = new MemoScreen @renderer, @shaders,
      map:      sampler
      items:    items * stretch
      width:    width
      height:   height
      depth:    depth
      stpq:     stpq

    @byteMemo.adopt @byteCompose

    # CPU-side buffers
    w = items  * width * stretch
    h = height * depth

    @samples   = @width * @height * @depth

    @bytes     = new Uint8Array w * h * 4 # non-RGBA render target not supported
    @floats    = new Float32Array @bytes.buffer if @isFloat
    @data      = if @isFloat then @floats else @bytes
    @streamer  = @generate @data

    @active    = {items: 0, width: 0, height: 0, depth: 0}
    @sampled   = {items: 0, width: 0, height: 0, depth: 0}
    @rect      = {w: 0, h: 0}
    @pad       = {x: 0, y: 0, z: 0, w: 0}

    @stretch   = stretch
    @isIndexed = isIndexed

    @setActive items, width, height, depth

  generate: (data) -> Util.Data.getStreamer data, @samples, 4, @items # non-RGBA render target not supported

  setActive: (items, width, height, depth) ->
    return unless items  != @active.items  or
                  width  != @active.width  or
                  height != @active.height or
                  depth  != @active.depth

    # Actively sampled area
    [@active.items, @active.width, @active.height, @active.depth] = [items, width, height, depth]

    # Render only necessary samples in RTTs
    @floatCompose?.cover width,            height, depth
    @byteCompose ?.cover width * @stretch, height, depth

    # Calculate readback buffer geometry
    items  = @items
    width  = @active.width
    height = if @depth == 1 then @active.height else @height
    depth  = @active.depth
    w      = items  * width * @stretch
    h      = height * depth

    # Calculate array paddings on readback
    [@sampled.items, @sampled.width, @sampled.height, @sampled.depth] = [items, width, height, depth]
    [@rect.w, @rect.h] = [w, h]
    [@pad.x, @pad.y, @pad.z, @pad.w] = [
      @sampled.width  - @active.width
      @sampled.height - @active.height
      @sampled.depth  - @active.depth
      @sampled.items  - @active.items
    ]

  update: (camera) ->
    @floatMemo?.render camera
    @byteMemo ?.render camera

  post: () ->
    @renderer.setRenderTarget @byteMemo.target.write
    @gl.readPixels 0, 0, @rect.w, @rect.h, gl.RGBA, gl.UNSIGNED_BYTE, @bytes

  readFloat: (n) -> @floatMemo?.read n
  readByte:  (n) -> @byteMemo ?.read n

  setCallback: (callback) ->
    @emitter = @callback callback

  callback: (callback) ->
    return callback unless @isIndexed

    n = @width
    m = @height
    o = @depth
    p = @items

    # Decode packed index
    f = (x, y, z, w) ->
      idx = w
      ll  = (idx % p)
      idx = ((idx - ll) / p)
      ii  = (idx % n)
      idx = ((idx - ii) / n)
      jj  = (idx % m)
      idx = ((idx - jj) / m)
      kk  = idx

      callback x, y, z, w, ii, jj, kk, ll

    f.reset = () -> callback.reset?()
    f

  iterate: () ->
    emit = @emitter
    emit.reset?()

    {consume, skip, count, done, reset} = @streamer
    reset()

    n     = @sampled.width  |0
    m     = @sampled.height |0
    o     = @sampled.depth  |0
    p     = @sampled.items  |0
    padX  = @pad.x          |0
    padY  = @pad.y          |0
    padZ  = @pad.z          |0
    padW  = @pad.w          |0
    limit = n * m * p * (o - padZ)

    if !@isIndexed
      callback = emit
      emit = (x, y, z, w) -> callback x, y, z, w, i, j, k, l

    i = j = k = l = m = 0
    while !done() && m < limit
      m++
      repeat = consume emit
      if ++l == p - padW
        skip padX
        l = 0
        if ++i == n - padX
          skip p * padX
          i = 0
          if ++j == m - padY
            skip p * n * padY
            j = 0
            k++
      if repeat == false
        break

    Math.floor count() / p

  dispose: () ->
    @floatMemo   ?.unadopt @floatCompose
    @floatMemo   ?.dispose()
    @floatCompose?.dispose()

    @byteMemo   ?.unadopt @byteCompose
    @byteMemo   ?.dispose()
    @byteCompose?.dispose()

    @floatMemo = @byteMemo = @floatCompose = @byteCompose = null

module.exports = Readback