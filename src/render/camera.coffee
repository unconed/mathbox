Renderable = require './renderable'

###
 Holds the external camera
###
class Camera extends Renderable
  constructor: (renderer, shaders, options) ->
    super renderer, shaders, options

    @camera  = options.camera if options?.camera?
    @camera ?= new THREE.PerspectiveCamera

  get: () -> @camera

  dispose: () ->
    delete @camera

module.exports = Camera