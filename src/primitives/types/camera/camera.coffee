Primitive = require '../../primitive'
Util = require '../../../util'

class Camera extends Primitive
  @traits = ['node', 'camera']

  init: () ->
    @camera = @_context.defaultCamera

  getCamera: () -> @camera

  change: (changed, touched, init) ->

    if changed['camera.position'] or
       changed['camera.quaternion'] or
       changed['camera.rotation'] or
       changed['camera.lookAt'] or
       init

      {position, rotation, lookAt} = @props

      @camera.position.copy   position

      if lookAt?
        @camera.lookAt        lookAt
      else
        @camera.quaternion.set 0, 0, 0, 1

      @camera.quaternion.multiply rotation if rotation?
      @camera.updateMatrix()

module.exports = Camera