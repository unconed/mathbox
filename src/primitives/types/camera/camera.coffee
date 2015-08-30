Primitive = require '../../primitive'
Util = require '../../../util'

class Camera extends Primitive
  @traits = ['node', 'camera']

  init: () ->

  make: () ->
    camera = @_context.defaultCamera
    @camera = if @props.proxy then camera else camera.clone()

  unmake: () ->

  getCamera: () -> @camera

  change: (changed, touched, init) ->

    if changed['camera.position'] or
       changed['camera.quaternion'] or
       changed['camera.rotation'] or
       changed['camera.lookAt'] or
       changed['camera.fov'] or
       init

      {position, rotation, lookAt, fov, aspect} = @props

      @camera.position.copy   position

      if lookAt?
        @camera.lookAt        lookAt
      else
        @camera.quaternion.set 0, 0, 0, 1

      if fov? and @camera.fov?
        @camera.fov = fov

      @camera.quaternion.multiply rotation if rotation?
      @camera.updateMatrix()

module.exports = Camera