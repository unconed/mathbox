Transform = require('./transform')

class Project4 extends Transform
  @traits: ['node', 'project4']

  make: () ->
    @uniforms =
      projectionMatrix: @node.attributes['project4.projection']

  unmake: () ->
    delete @uniforms

  change: (changed, touched, init) ->
    return unless init

  to: (vector) ->
    vector.applyMatrix4 @projectionMatrix

  transform: (shader) ->
    shader.call 'project4.position', @uniforms
    @parent?.transform shader

module.exports = Project4
