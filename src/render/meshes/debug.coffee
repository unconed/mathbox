Base = require './base'

class Debug extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders

    @geometry = new THREE.PlaneGeometry 1, 1
    @material = new THREE.MeshBasicMaterial({ map: options.map });
    @material.side = THREE.DoubleSide

    object = new THREE.Mesh @geometry, @material
    object.position.y += 1;
    object.frustumCulled = false;

    @objects = [object]

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @objects = @geometry = @material = null
    super

module.exports = Debug
