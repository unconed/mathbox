Atlas = require './atlas'

SCRATCH_SIZE = 512 / 16

class TextAtlas extends Atlas
  constructor: (renderer, shaders, options) ->
    @font    = options.font
    @font    = '24px sans-serif' if @font == ''
    @outline = options.outline || 0

    options.width    ||= 64
    options.height   ||= 64

    options.type     = THREE.UnsignedByteType
    options.channels = 2
    options.backed   = true

    super renderer, shaders, options

  build: (options) ->
    super options

    lineHeight = 16
    lineHeight = Math.ceil size for size in @font.split ' ' when (size = parseInt size, 10) > 0
    lineHeight += 4 + @outline
    
    maxWidth = SCRATCH_SIZE * lineHeight
    
    canvas = document.createElement 'canvas'
    canvas.width  = maxWidth
    canvas.height = lineHeight

    #document.body.appendChild canvas
    #canvas.setAttribute('style', "position: absolute; top: 0; left: 0; z-index: 100; border: 1px solid red; background: #888;")
    
    context = canvas.getContext '2d'
    context.font         = @font
    context.fillStyle    = '#ffffff'
    context.strokeStyle  = '#000000'
    context.lineWidth    = @outline * 2
    context.textAlign    = 'left'
    context.textBaseline = 'top'
    
    scratch = new Uint8Array maxWidth * lineHeight * 2
    
    @canvas     = canvas
    @context    = context
    @lineHeight = lineHeight
    @maxWidth   = maxWidth
    @scratch    = scratch

    @_allocate = @allocate.bind @
    @_write    = @write   .bind @

  reset: () ->
    super
    @mapped = {}

  begin: () ->
    row.alive = 0 for row in @rows
  
  end: () ->
    mapped = @mapped
    for row in @rows.slice() when row.alive == 0
      delete mapped[key] for key in row.keys
      @collapse row
    return

  map: (text, emit) ->
    # See if already mapped into atlas
    mapped = @mapped
    c      = mapped[text]
    if c?
      c.row.alive++
      return emit c.x, c.y, c.w, c.h

    # Draw text
    allocate = @_allocate
    write    = @_write
    @draw text, (data, w, h) -> 
      # Allocate and write into atlas
      allocate text, w, h, (row, x, y) ->
        mapped[text] = {x, y, w, h, row}
        write data, x, y, w, h
        emit x, y, w, h

  draw: (text, emit) ->
    c = @context
    h = @lineHeight
    w = @width
    o = @outline + 2

    dst = @scratch
    max = @maxWidth
    
    m = c.measureText text
    w = Math.min max, Math.ceil m.width + 2 * o

    c.clearRect  0, 0, w, h
    c.strokeText text, o, o
    c.fillText   text, o, o
    
    {data} = c.getImageData 0, 0, w, h
    j = k = 0
    for i in [0...data.length / 4]
      dst[k++] = data[j]
      dst[k++] = data[j + 3]
      j += 4

    emit dst, w, h
      

module.exports = TextAtlas