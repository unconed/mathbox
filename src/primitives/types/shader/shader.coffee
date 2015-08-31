Primitive = require '../../primitive'
Util      = require '../../../util'

class Shader extends Primitive
  @traits = ['node', 'bind', 'shader']
  @freeform = true

  init: () ->
    @shader = null

  make: () ->
    {language, code} = @props
    throw new Error "GLSL required" if language != 'glsl'

    # Bind to attached data sources
    @_helpers.bind.make [
      { to: 'shader.sources', trait: 'source', multiple: true }
    ]

    # Parse snippet w/ shadergraph (will do implicit DOM script tag by ID lookup if simple selector or ID given)
    snippet = @_shaders.fetch(code)

    # Convert uniforms to attributes
    types    = @_types
    uniforms = {}
    make = (type) =>
      switch type
        when 'i'  then types.int()
        when 'f'  then types.number()
        when 'v2' then types.vec2()
        when 'v3' then types.vec3()
        when 'v4' then types.vec4()
        when 'm3' then types.mat3()
        when 'm4' then types.mat4()
        when 't'  then types.object()
        else
          t = type.split('')
          if t.pop() == 'v'
            types.array(make t.join(''))
          else
            null

    for def in snippet._signatures.uniform
      uniforms[def.name] = type if type = make def.type

    # Reconfigure node model
    @reconfigure {props: {uniform: uniforms}}

  made: () ->
    # Notify of shader reallocation
    @trigger
      type: 'source.rebuild'

  unmake: () ->
    @shader = null

  change: (changed, touched, init) ->
    return @rebuild() if changed['shader.uniforms'] or
                         changed['shader.code'] or
                         changed['shader.language']

  shaderBind: (uniforms = {}) ->
    {language, code} = @props

    # Merge in prop attributes as uniforms
    uniforms[v.short] ?= v for k, v of @node.attributes when v.type? and v.short? and v.ns == 'uniform'

    # Merge in explicit uniform object if set
    uniforms[k] = v for k, v of u if (u = @props.uniforms)?

    # New shader
    s = @_shaders.shader()

    # Require sources
    if @bind.sources?
      s.require source.sourceShader @_shaders.shader() for source in @bind.sources

    # Build bound shader
    s.pipe(code, uniforms)

module.exports = Shader