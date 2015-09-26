Atlas = require './atlas'

SCRATCH_SIZE = 512 / 16

###
# Dynamic text atlas
# - Stores entire strings as sprites
# - Renders alpha mask (fast) or signed distance field (slow)
# - Emits (x,y,width,height) pointers into the atlas
###
class TextAtlas extends Atlas
  constructor: (renderer, shaders, options) ->
    @font    = options.font ? ['sans-serif']
    @size    = options.size || 24
    @style   = options.style ? 'normal'
    @variant = options.variant ? 'normal'
    @weight  = options.weight ? 'normal'
    @outline = +(options.outline ? 5) ? 0

    options.width    ||= 256
    options.height   ||= 256

    options.type     = THREE.UnsignedByteType
    options.channels = 1
    options.backed   = true

    @gamma = 1
    if typeof navigator != 'undefined'
      ua = navigator.userAgent
      @gamma = .5 if ua.match(/Chrome/) and ua.match(/OS X/)

    @scratchW = @scratchH = 0

    super renderer, shaders, options

  build: (options) ->
    super options

    # Prepare line-height with room for outline
    lineHeight = 16
    lineHeight = @size
    lineHeight += 4 + 2 * Math.min 1, @outline
    maxWidth = SCRATCH_SIZE * lineHeight

    # Prepare scratch canvas
    canvas = document.createElement 'canvas'
    canvas.width  = maxWidth
    canvas.height = lineHeight

    # Font string
    quote = (str) -> "\"#{str.replace /(['"\\])/g, '\\$1'}\""
    font  = @font.map(quote).join ", "

    context = canvas.getContext '2d'
    context.font         = "#{@style} #{@variant} #{@weight} #{@size}px #{@font}"
    context.fillStyle    = '#FF0000'
    context.textAlign    = 'left'
    context.textBaseline = 'bottom'
    context.lineJoin     = 'round'

    # debug: show scratch canvas
    ###
    document.body.appendChild canvas
    canvas.setAttribute('style', "position: absolute; top: 0; left: 0; z-index: 100; border: 1px solid red; background: rgba(255,0,255,.25);")
    ###

    # Cache hex colors for distance field rendering
    colors = []
    dilate = @outline * 3
    for i in [0...dilate]
      # 8 rgb levels = 1 step = .5 pixel increase
      hex = ('00' + Math.max(0, -i * 8 + 128 - (!i)*8).toString 16).slice -2
      colors.push '#' + hex + hex + hex

    scratch = new Uint8Array maxWidth * lineHeight * 2

    @canvas     = canvas
    @context    = context
    @lineHeight = lineHeight
    @maxWidth   = maxWidth
    @colors     = colors
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

    # Draw text (don't recurse stack in @draw so it can be optimized cleanly)
    @draw text
    data = @scratch
    w    = @scratchW
    h    = @scratchH

    # Allocate and write into atlas
    allocate = @_allocate
    write    = @_write
    allocate text, w, h, (row, x, y) ->
      mapped[text] = {x, y, w, h, row}
      write data, x, y, w, h
      emit x, y, w, h

  draw: (text) ->
    w = @width
    h = @lineHeight
    o = @outline
    ctx = @context
    dst = @scratch
    max = @maxWidth
    colors = @colors

    # Bottom aligned
    x = o + 1
    y = Math.round h * 1.05 - 1

    # Measure text
    m = ctx.measureText text
    w = Math.min max, Math.ceil m.width + 2 * x + 1

    # Clear scratch area
    ctx.clearRect  0, 0, w, h

    if @outline == 0
      # Alpha sprite (fast)
      ctx.fillText text, x, y
      {data} = imageData = ctx.getImageData 0, 0, w, h
      j = 3 # Skip to alpha channel
      for i in [0...data.length / 4]
        #dst[i] = 255 * (i%2); # test pattern to check pixel perfect alignment
        dst[i] = data[j]
        j += 4

      @scratchW = w
      @scratchH = h

    else
      # Signed distance field sprite (approximation) (slow)

      # Draw strokes of decreasing width to create nested outlines (absolute distance)
      ctx.globalCompositeOperation = 'source-over'
      for i in [o+1..1]
        j = if i > 1 then i * 2 - 2 else i # Eliminate odd strokes once past > 1px, don't need the detail
        ctx.strokeStyle = colors[j - 1]
        ctx.lineWidth   = j
        ctx.strokeText text, x, y
        #console.log 'stroke', j, j+.5, colors[j]

      # Fill center with multiply blend #FF0000 to mark inside/outside
      ctx.globalCompositeOperation = 'multiply'
      ctx.fillText   text, x, y

      # Pull image data
      {data} = imageData = ctx.getImageData 0, 0, w, h
      j = 0
      gamma = @gamma

      for i in [0...data.length / 4]
        # Get value + mask
        a     = data[j]
        mask  = if a then data[j + 1] / a else 1
        mask  = Math.sqrt(mask) if gamma == .5
        mask  = Math.min 1, Math.max 0, mask

        # Blend between positive/outside and negative/inside
        b     = 256 - a
        c     = b + (a - b) * mask

        # Clamp
        # (slight expansion to hide errors around the transition)
        dst[i] = Math.max 0, Math.min 255, c + 2
        j += 4

      # Debug: copy back into canvas
      ###
      j = 0
      for i in [0...data.length / 4]
        v = dst[i]
        #data[j] = v
        #data[j+1] = v
        data[j+2] = v
        data[j+3] = 255
        j += 4
      ctx.putImageData imageData, 0, 0
      ###

      @scratchW = w
      @scratchH = h


module.exports = TextAtlas