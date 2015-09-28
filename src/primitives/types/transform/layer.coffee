Transform = require './transform'
π = Math.PI

class Layer extends Transform
  @traits = ['node', 'vertex', 'layer']

  make: () ->
    @_listen 'root', 'root.resize', @update

    @uniforms =
      layerScale: @_attributes.make @_types.vec4()
      layerBias:  @_attributes.make @_types.vec4()

  update: () ->
    camera = @_inherit('root').getCamera()
    size   = @_inherit('root').getSize()

    aspect = camera.aspect ? 1
    fov    = camera.fov    ? 1

    pitch  = Math.tan fov * π / 360

    _enum = @node.attributes['layer.fit'].enum

    {fit, depth, scale} = @props

    # Convert contain/cover into x/y
    switch fit
      when _enum.contain
        fit = if aspect > 1 then _enum.y else _enum.x
      when _enum.cover
        fit = if aspect > 1 then _enum.x else _enum.y

    # Fit x/y
    switch fit
      when _enum.x
        @uniforms.layerScale.value.set pitch * aspect, pitch * aspect
      when _enum.y
        @uniforms.layerScale.value.set pitch, pitch

    @uniforms.layerBias.value.set 0, 0, -depth, 0

  change: (changed, touched, init) ->
    if changed['layer.fit'] or
       changed['layer.depth'] or
       init

      @update()

  # End transform chain here without applying camera view
  vertex: (shader, pass) ->
    return shader.pipe 'layer.position', @uniforms if pass == 2
    return shader.pipe 'root.position'             if pass == 3
    shader

module.exports = Layer