Renderable    = require '../renderable'
Util          = require '../../util'
DataTexture   = require './texture/datatexture'
BackedTexture = require './texture/backedtexture'

###
# Dynamic sprite atlas
#
# - Allocates variable-sized sprites in rows
# - Will grow itself when full
###
class Atlas extends Renderable
  constructor: (renderer, shaders, options) ->
    @width    ?= options.width    || 512
    @height   ?= options.height   || 512
    @channels ?= options.channels || 4
    @backed   ?= options.backed   || false

    @samples = @width * @height

    super renderer, shaders
    @build options

  shader: (shader) ->
    shader.pipe "map.2d.data", @uniforms
    shader.pipe "sample.2d", @uniforms
    shader.pipe Util.GLSL.swizzleVec4 ['0000', 'x000', 'xw00', 'xyz0'][@channels] if @channels < 4
    shader

  build: (options) ->
    @klass   = klass = if @backed then BackedTexture else DataTexture
    @texture = new klass @gl, @width, @height, @channels, options

    @uniforms =
      dataPointer:
        type: 'v2'
        value: new THREE.Vector2(0, 0)
    @_adopt @texture.uniforms

    @reset()

  reset: () ->
    @rows    = []
    @bottom  = 0

  resize: (width, height) ->
    throw new Error "Cannot resize unbacked texture atlas" if !@backed
    if width > 2048 and height > 2048
      console.warn "Giant text atlas #{width}x#{height}."
    else
      console.info "Resizing text atlas #{width}x#{height}."

    @texture.resize width, height

    @width   = width
    @height  = height
    @samples = width * height

  collapse: (row) ->
    rows = @rows
    rows.splice rows.indexOf(row), 1
    @bottom = rows[rows.length - 1]?.bottom ? 0
    @last = null if @last == row

  allocate: (key, width, height, emit) ->
    w   = @width
    h   = @height

    max = height * 2

    if width > w
      @resize w * 2, h * 2
      @last = null
      # Try again
      return @allocate key, width, height, emit

    # See if we can append to the last used row (fast code path)
    row = @last
    if row?
      if row.height >= height and row.height < max and row.width + width <= w
        row.append key, width, height, emit
        return

    # Scan all rows and append to the first suitable one (slower code path)
    bottom = 0
    index  = -1
    top    = 0
    for row, i in @rows
      # Measure gap between rows
      # Note suitable holes for later
      gap    = row.top - bottom
      if gap >= height and index < 0
        index = i
        top   = bottom
      bottom = row.bottom

      if row.height >= height and row.height < max and row.width + width <= w
        row.append key, width, height, emit
        @last = row
        return

    # New row (slowest path)
    if index >= 0
      # Fill a gap
      row = new Row top, height
      @rows.splice index, 0, row
      #console.log 'fill gap', row
    else
      # Append to bottom
      top = bottom
      bottom += height

      # Resize if atlas is full
      if bottom >= h
        @resize w * 2, h * 2
        @last = null
        # Try again
        return @allocate key, width, height, emit

      # Add new row to the end
      row = new Row top, height
      @rows.push row
      @bottom = bottom

    row.append key, width, height, emit
    @last = row
    return

  read: () ->
    @texture.textureObject

  write: (data, x, y, w, h) ->
    @texture.write data, x, y, w, h

  dispose: () ->
    @texture.dispose()
    @data = null
    super

class Row
  constructor: (top, height) ->
    @top    = top
    @bottom = top + height
    @width  = 0
    @height = height
    @alive  = 0
    @keys   = []

  append: (key, width, height, emit) ->
    x = @width
    y = @top
    @alive++
    @width += width
    @keys.push key
    emit @, x, y

module.exports = Atlas