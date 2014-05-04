Base            = require './base'
SurfaceGeometry = require('../geometry').SurfaceGeometry

class Surface extends Base
  constructor: (gl, shaders, options) ->
    super gl, shaders

    uniforms = options.uniforms ? {}
    position = options.position
    shaded   = options.shaded ? true

    @geometry = new SurfaceGeometry
      width:    options.width    || 2
      height:   options.height   || 2
      surfaces: options.surfaces || 1
      layers:   options.layers   || 1

    factory = shaders.material()

    v = factory.vertex
    v.import position if position
    v.split()
    v  .call 'surface.position', uniforms if !shaded
    v  .call 'surface.position.normal', uniforms, '_shade_' if shaded
    v.pass()
    v.call 'project.position', uniforms

    f = factory.fragment
    f.call 'style.color', uniforms if !shaded
    f.call 'style.color.shaded', uniforms, '_shade_' if shaded

    @material = new THREE.ShaderMaterial factory.build
      side: THREE.DoubleSide
      defaultAttributeValues: null
      index0AttributeName: "position4"

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
