Buffer = require('./buffer')
Texture = require('./texture')

class DataBuffer extends Buffer
  constructor: (gl, shaders, options) ->
    super gl, shaders, options

  build: () ->
    super

    @data = new Float32Array @samples * @channels
    @texture = new Texture @gl, @samples, 1, @channels
    @dataPointer = @uniforms.dataPointer.value
    @_adopt @texture.uniforms

  write: (samples = @samples) ->
    @texture.write @data, 0, 0, samples, 1
    @dataPointer.set .5, .5

module.exports = DataBuffer