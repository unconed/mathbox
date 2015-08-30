Transform = require './transform'

class Transform4 extends Transform
  @traits = ['node', 'vertex', 'transform4']

  make: () ->
    @uniforms =
      transformMatrix: @_attributes.make @_types.mat4()
      transformOffset: @node.attributes['transform4.position']

    @transformMatrix = @uniforms.transformMatrix.value

  unmake: () ->
    delete @uniforms

  change: (changed, touched, init) ->
    return @rebuild() if changed['transform4.pass']
    return unless touched['transform4'] or init

    s = @props.scale
    m = @props.matrix

    t = @transformMatrix
    t.copy  m
    t.scale s

  vertex: (shader, pass) ->
    shader.pipe 'transform4.position', @uniforms if pass == @props.pass
    super shader, pass

module.exports = Transform4
