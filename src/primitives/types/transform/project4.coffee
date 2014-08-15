Transform = require('./transform')

class Project4 extends Transform
  @traits: ['node', 'project4']

  make: () ->
    @uniforms =
      projectionMatrix: @node.attributes['project4.projection']

  unmake: () ->
    delete @uniforms

  to: (vector) ->
    vector.applyMatrix4 @projectionMatrix

  transform: (shader) ->
    shader.pipe 'project4.position', @uniforms
    @parent?.transform shader

module.exports = Project4
