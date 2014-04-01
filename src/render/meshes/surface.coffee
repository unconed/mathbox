Base            = require './base'
SurfaceGeometry = require('../geometry').SurfaceGeometry

class Surface extends Base
  constructor: (gl, shaders, options) ->
    super gl, shaders

    uniforms = options.uniforms ? {}
    position = options.position

    @geometry = new SurfaceGeometry
      width:    options.width    || 2
      height:   options.height   || 2
      surfaces: options.surfaces || 1

    factory = shaders.material()

    v = factory.vertex
    v.import position if position
    v.split()
    v  .call 'surface.position', uniforms
    v.pass()
    v.call 'project.position'

    f = factory.fragment
    f.call 'style.color', uniforms

    @material = new THREE.ShaderMaterial factory.build
      side: THREE.DoubleSide
      defaultAttributeValues: null

    window.material = @material

    @object = new THREE.Mesh @geometry, @material
    @object.frustumCulled = false;
    @object.matrixAutoUpdate = false;

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @object = @geometry = @material = null
    super

module.exports = Surface
