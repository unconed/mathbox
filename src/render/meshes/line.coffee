Base         = require './base'
LineGeometry = require('../geometry').LineGeometry

class Line extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    uniforms = options.uniforms ? {}
    position = options.position
    color    = options.color
    clip     = options.clip

    @geometry = new LineGeometry
      samples: options.samples
      strips:  options.strips
      ribbons: options.ribbons
      layers:  options.layers
      anchor:  options.anchor

    @_adopt uniforms
    @_adopt @geometry.uniforms

    factory = shaders.material()

    v = factory.vertex
    if color
      v.require color
      v.pipe 'mesh.vertex.color',   @uniforms
    v.require position if position
    v.split()
    v  .pipe 'line.position',       @uniforms
    v.pass()
    v.fan()
    v  .pipe 'line.clipEnds',       @uniforms if clip
    v.next()
    v  .pipe 'project.position',    @uniforms
    v.join()

    f = factory.fragment
    f.pipe 'fragment.clipEnds',     @uniforms if clip
    f.pipe 'style.color',           @uniforms
    f.pipe 'mesh.fragment.color',   @uniforms if color
    f.pipe 'fragment.color',        @uniforms

    @material = new THREE.ShaderMaterial factory.build
      side: THREE.DoubleSide
      defaultAttributeValues: null
      index0AttributeName: "position4"

    object = new THREE.Mesh @geometry, @material

    @_raw object
    @objects = [object]

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @objects = @geometry = @material = null
    super

module.exports = Line
