Renderable   = require '../renderable'

class Debug extends Renderable
  constructor: (gl, shaders, options) ->
    super gl, shaders

    @geometry = new THREE.PlaneGeometry 1, 1
    @material = new THREE.MeshBasicMaterial({ map: options.map });

    @object = new THREE.Mesh @geometry, @material
    @object.frustumCulled = false;

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @object = @geometry = @material = null
    super

module.exports = Debug
