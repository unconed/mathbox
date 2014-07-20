Base         = require './base'
LineGeometry = require('../geometry').LineGeometry

class Line extends Base
  constructor: (gl, shaders, options) ->
    super gl, shaders

    uniforms = options.uniforms ? {}
    position = options.position
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
    v.import position if position
    v.split()
    v  .call 'line.position',    @uniforms
    v.pass()
    v.fan()
    v  .call 'line.clipEnds',    @uniforms, '_clip_' if clip
    v.next()
    v  .call 'project.position', @uniforms
    v.join()

    f = factory.fragment
    f.call 'fragment.clipEnds',  @uniforms, '_clip_' if clip
    f.call 'style.color',        @uniforms
    f.call 'fragment.color',     @uniforms

    @material = new THREE.ShaderMaterial factory.build
      side: THREE.DoubleSide
      defaultAttributeValues: null
      index0AttributeName: "position4"

    window.material = @material

    object = new THREE.Mesh @geometry, @material
    object.frustumCulled = false;
    object.matrixAutoUpdate = false;

    @objects = [object]

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @objects = @geometry = @material = null
    super

module.exports = Line
