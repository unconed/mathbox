Parent = require '../base/parent'
Util = require '../../../util'

class RTT extends Parent
  @traits = ['node', 'root', 'scene', 'vertex', 'texture', 'rtt', 'source', 'index', 'image']
  @defaults =
    minFilter: 'linear',
    magFilter: 'linear',
    type:      'unsignedByte',

  init: () ->
    @rtt = @scene = @camera = @width = @height = @history = @rootSize = @size = null

  indexShader: (shader) -> shader
  imageShader: (shader) -> @rtt.shaderRelative shader
  sourceShader: (shader) -> @rtt.shaderAbsolute shader, @history

  getDimensions: () ->
    items:  1
    width:  @width
    height: @height
    depth:  @history

  getActiveDimensions: () -> @getDimensions()

  make: () ->
    @parentRoot = @_inherit 'root'
    @rootSize = @parentRoot.getSize()

    @_listen @parentRoot, 'root.pre',    @pre
    @_listen @parentRoot, 'root.update', @update
    @_listen @parentRoot, 'root.render', @render
    @_listen @parentRoot, 'root.post',   @post
    @_listen @parentRoot, 'root.camera', @setCamera
    @_listen @parentRoot, 'root.resize', (event) -> @resize event.size

    return unless @rootSize?

    {minFilter, magFilter, type} = @props

    {width, height, history, size} = @props

    relativeSize = size == @node.attributes['rtt.size'].enum.relative
    widthFactor  = if relativeSize then @rootSize.renderWidth  else 1
    heightFactor = if relativeSize then @rootSize.renderHeight else 1

    @width    = Math.round if width?  then (width  * widthFactor ) else @rootSize.renderWidth
    @height   = Math.round if height? then (height * heightFactor) else @rootSize.renderHeight
    @history  = history
    @aspect   = aspect = @width / @height

    @scene ?= @_renderables.make 'scene'
    @rtt    = @_renderables.make 'renderToTexture',
      scene:     @scene
      camera:    @_context.defaultCamera
      width:     @width
      height:    @height
      frames:    @history
      minFilter: minFilter
      magFilter: magFilter
      type:      type

    aspect     = if width or height then aspect else @rootSize.aspect
    viewWidth  = width  ? @rootSize.viewWidth
    viewHeight = height ? @rootSize.viewHeight

    @size =
      renderWidth:  @width
      renderHeight: @height
      aspect:       aspect
      viewWidth:    viewWidth
      viewHeight:   viewHeight
      pixelRatio:   @height / viewHeight

  made: () ->
    # Notify of buffer reallocation
    @trigger
      type: 'source.rebuild'

    if @size
      @trigger
        type: 'root.resize'
        size: @size

  unmake: (rebuild) ->
    return unless @rtt?

    @rtt.dispose()
    @scene.dispose() unless rebuild

    @rtt = @width = @height = @history = null

  change: (changed, touched, init) ->
    return @rebuild() if touched['texture']    or
                         changed['rtt.width']  or
                         changed['rtt.height']

    if changed['root.camera'] or
       init

      @_unattach()
      @_attach @props.camera, 'camera', @setCamera, @, @, true
      @setCamera()

  adopt:   (renderable) -> @scene.add    object for object in renderable.renders
  unadopt: (renderable) -> @scene.remove object for object in renderable.renders

  resize: (size) ->
    @rootSize = size

    {width, height, size} = @props
    relativeSize = size == @node.attributes['rtt.size'].enum.relative

    return @rebuild() if !@rtt or !width? or !height? or relativeSize

  select: (selector) ->
    @_root.node.model.select selector, [@node]

  watch: (selector, handler) ->
    @_root.node.model.watch selector, handler

  unwatch: (handler) ->
    @_root.node.model.unwatch handler

  pre:    (e) ->
    @trigger e
  update: (e) ->
    if (camera = @getOwnCamera())?
      camera.aspect = @aspect || 1
      camera.updateProjectionMatrix()
    @trigger e
  render: (e) ->
    @trigger e
    @rtt?.render @getCamera()
  post:   (e) ->
    @trigger e

  setCamera: () ->
    camera = @select(@props.camera)[0]?.controller
    if @camera != camera
      @camera = camera
      @rtt.camera = @getCamera()
      @trigger {type: 'root.camera'}
    else if !@camera
      @trigger {type: 'root.camera'}

  getOwnCamera: () -> @camera?.getCamera()
  getCamera:    () -> @getOwnCamera() ? @_inherit('root').getCamera()

  # End transform chain here
  vertex: (shader, pass) ->
    return shader.pipe 'view.position' if pass == 2
    return shader.pipe 'root.position' if pass == 3
    shader

module.exports = RTT