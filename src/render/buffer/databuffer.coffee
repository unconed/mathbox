Buffer = require('./buffer')
Texture = require('./texture')

class DataBuffer extends Buffer
  constructor: (gl, options) ->
    super gl, options

  build: () ->
    super

    @data = new Float32Array @samples * @channels
    @texture = new Texture @gl, @samples, 1, @channels
    @dataPointer = @uniforms.dataPointer.value
    @_adopt @texture.uniforms

  write: () ->
    @texture.write @data, 0, @index, @samples, 1
    @dataPointer.set .5, @index + .5
    @index = (@index + 1) % @history

module.exports = LineBuffer