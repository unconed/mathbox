Base = require './base'

class Debug extends Base
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    @geometry = new THREE.PlaneGeometry 1, 1
    @material = new THREE.MeshBasicMaterial map: options.map
    @material.side = THREE.DoubleSide

    object = new THREE.Mesh @geometry, @material
    object.position.x += options.x || 0
    object.position.y += options.y || 0
    object.frustumCulled = false
    object.scale.set 2, 2, 2
    object.__debug = true

    @objects = [object]

  dispose: () ->
    @geometry.dispose()
    @material.dispose()
    @objects = @geometry = @material = null
    super

module.exports = Debug
