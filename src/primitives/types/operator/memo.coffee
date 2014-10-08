Operator = require './operator'
Util     = require '../../../util'

class Memo extends Operator
  @traits: ['node', 'bind', 'operator', 'source', 'image', 'texture', 'memo']

  imageShader: (shader) ->
    @rtt.shaderRelative shader

  sourceShader: (shader) ->
    @rtt.shaderAbsolute shader, 1

  update: () ->
    @rtt?.render()

  resize: () ->
    @refresh()
    super

  make: () ->
    super
    return unless @bind.source?

    # Listen for updates
    @memoRoot = @_inherit 'root'

    @handler = () => @update()
    @memoRoot.on  'root.update', @handler

    # Read sampling parameters
    minFilter = @_get 'texture.minFilter'
    magFilter = @_get 'texture.magFilter'
    type      = @_get 'texture.type'

    # Fetch geometry dimensions
    dims   = @bind.source.getDimensions()
    items  = dims.items
    width  = dims.width
    height = dims.height
    depth  = dims.depth

    # Prepare memoization RTT
    @rtt    = @_renderables.make 'renderToTexture',
      width:     items  * width
      height:    height * depth
      frames:    1
      minFilter: minFilter
      magFilter: magFilter
      type:      type

    uniforms =
      remap2DScale:    @_attributes.make @_types.vec2()
      remapModulus:    @_attributes.make @_types.vec2()
      remapModulusInv: @_attributes.make @_types.vec2()

    @remap2DScale    = uniforms.remap2DScale.value
    @remapModulus    = uniforms.remapModulus.value
    @remapModulusInv = uniforms.remapModulusInv.value

    # Build shader to remap data (do it after RTT creation to allow feedback)
    operator = @_shaders.shader()
    operator.pipe 'screen.remap.4d.xyzw', uniforms
    @bind.source.sourceShader operator

    # Make screen renderable inside RTT scene
    @compose = @_renderables.make 'screen', fragment: operator
    @rtt.scene.add object for object in @compose.objects

    # Notify of reallocation
    @trigger
      type: 'source.rebuild'

  unmake: () ->
    super

    if @bind.source?
      @rtt.scene.remove object for object in @compose.objects
      @compose = null

      @rtt.dispose()
      @rtt = null

      @memoRoot.off 'root.update', @handler
      @memoRoot = null

  change: (changed, touched, init) ->
    return @rebuild() if touched['memo'] or
                         touched['operator']

    return unless @bind.source?

    if touched['memo'] or
       init

      # Fetch geometry dimensions
      dims   = @bind.source.getActive()
      items  = dims.items
      width  = dims.width
      height = dims.height
      depth  = dims.depth

      @remap2DScale   .set items * width, height * depth
      @remapModulus   .set items, height
      @remapModulusInv.set 1 / items, 1 / height

module.exports = Memo
