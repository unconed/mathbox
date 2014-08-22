debug = false

tick = () ->
  now = +new Date
  return (label) ->
    delta = +new Date() - now
    console.log label, delta + " ms"
    delta

class Geometry extends THREE.BufferGeometry
  constructor: () ->
    THREE.BufferGeometry.call @
    @uniforms ?= {}
    @offsets  ?= []

    @tock = tick() if debug
    @chunked = false
    @limit   = 0xFFFF

  _reduce: (dims, maxs) ->
    multiple = false
    for dim, i in dims
      max = maxs[i]
      if multiple
        dims[i] = max
      if dim > 1
        multiple = true

    quads = dims.reduce (a, b) -> a * b

  _emitter: (name) ->
    attribute  = @attributes[name]
    dimensions = attribute.itemSize
    array      = attribute.array

    offset = 0

    one = (a) ->
      array[offset++] = a
    two = (a, b) ->
      array[offset++] = a
      array[offset++] = b
    three = (a, b, c) ->
      array[offset++] = a
      array[offset++] = b
      array[offset++] = c
    four = (a, b, c, d) ->
      array[offset++] = a
      array[offset++] = b
      array[offset++] = c
      array[offset++] = d

    [null, one, two, three, four][dimensions]

  _autochunk: () ->
    indexed = @attributes.index
    for name, attribute of @attributes
      if name != 'index' and indexed
        numItems = attribute.array.length / attribute.itemSize
        if numItems > @limit
          @chunked = true
        break

    if @chunked and !indexed.u16
      indexed.u16   = array = indexed.array
      indexed.array = new Uint32Array array.length

  _finalize: () ->
    return if !@chunked

    attrib = @attributes.index
    @chunks = @_chunks attrib.array, @limit
    @_chunkify attrib, @chunks

    return @tock @constructor.name if debug

  _chunks: (array, limit) ->
    chunks = []

    last   = 0
    start  = array[0]
    end    = array[0]

    push = (i) ->
      _start = last * 3
      _end   = i * 3
      _count = _end - _start

      chunks.push
        index: start
        start: _start
        count: _count
        end:   _end

    n = Math.floor array.length / 3
    o = 0
    for i in [0...n]
      j1 = array[o++]
      j2 = array[o++]
      j3 = array[o++]

      jmin = Math.min j1, j2, j3
      jmax = Math.max j1, j2, j3

      a = Math.min start, jmin
      b = Math.max end,   jmax

      if b - a > limit
        push i

        a = jmin
        b = jmax
        last = i

      start = a
      end   = b

    push n

    chunks

  _chunkify: (attrib, chunks) ->
    return unless attrib.u16

    from = attrib.array
    to   = attrib.u16
    for chunk in chunks
      offset = chunk.index
      to[i] = from[i] - offset for i in [chunk.start...chunk.end]

    attrib.array = attrib.u16
    delete attrib.u16

  _offsets: (offsets) ->
    if !@chunked
      @offsets = offsets
    else
      chunks = @chunks
      out    = @offsets
      out.length = null

      for offset in offsets
        start = offset.start
        end   = offset.count - start

        for chunk in chunks
          _start = chunk.start
          _end   = chunk.end

          if start <= _start and end >  _start or
             start <  _end   and end >= _end   or
             start >  _start and end <  _end

            _start = Math.max start, _start
            _end   = Math.min end,   _end

            out.push
              index: chunk.index
              start: _start
              count: _end - _start

    null


module.exports = Geometry