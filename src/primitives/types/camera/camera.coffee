Primitive = require '../../primitive'
Util = require '../../../util'

class Camera extends Primitive
  @traits = ['node', 'camera']

  init: () ->

  make: () ->
    camera = @_context.defaultCamera
    @camera = if @props.proxy then camera else camera.clone()

    @euler = new THREE.Euler
    @quat = new THREE.Quaternion

  unmake: () ->

  getCamera: () -> @camera

  change: (changed, touched, init) ->

    if changed['camera.position'] or
       changed['camera.quaternion'] or
       changed['camera.rotation'] or
       changed['camera.lookAt'] or
       changed['camera.up'] or
       changed['camera.fov'] or
       init

      {position, quaternion, rotation, lookAt, up, fov, aspect} = @props

      # Apply transform conservatively to avoid conflicts with controls / proxy
      if position?
        @camera.position.copy   position

      if quaternion? or rotation? or lookAt?
        if lookAt?
          @camera.lookAt        lookAt
        else
          @camera.quaternion.set 0, 0, 0, 1

        if rotation?
          @euler.setFromVector3 rotation, Util.Three.swizzleToEulerOrder @props.eulerOrder
          @quat .setFromEuler @euler
          @camera.quaternion.multiply @quat

        if quaternion?
          @camera.quaternion.multiply quaternion

      if fov? and @camera.fov?
        @camera.fov = fov

      if up?
        @camera.up.copy up

      @camera.updateMatrix()

module.exports = Camera