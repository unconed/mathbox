# Global constructor
mathBox = (options) ->
  options ?= {}

  three = THREE.Bootstrap options
  three.install 'mathbox' if !three.MathBox?

  three.mathbox ? three

# Just because
window.π = Math.PI
window.τ = π * 2
window.e = Math.E

# Namespace
window.MathBox = exports
window.mathBox = exports.mathBox = mathBox
exports.version = '2'

# Load context and export namespace
Context = require './context'
exports[k] = v for k, v of Context.Namespace

# Threestrap plugin
THREE.Bootstrap.registerPlugin 'mathbox',
  defaults:
    init:    true
    warmup:  5
    inspect: true
    splash:  true
    color:   'mono'

  listen: ['ready', 'pre', 'render', 'update', 'post', 'resize'],

  # Install meta-API
  install: (three) ->
    inited = false
    @first = true

    three.MathBox =
      # Init the mathbox context
      init: (options) =>
        return if inited
        inited = true

        scene  = options?.scene  || @options.scene  || three.scene
        camera = options?.camera || @options.camera || three.camera

        @context = new Context three.renderer, scene, camera

        # Enable handy destructuring
        @context.api.three   = three.three   = three
        @context.api.mathbox = three.mathbox = @context.api

        # Initialize and set initial size
        @context.init()
        @context.resize three.Size

        # Set warmup mode and track pending objects
        @context.warmup @options.warmup
        @pending = 0
        @remain  = 0
        @warm    = false

        # Minimal splash screen to distract from the blocking native shader compilation
        @makeSplash if @options.splash

        console.log "MathBox", MathBox.version

      # Destroy the mathbox context
      destroy: () =>
        return if !inited
        inited = false

        @context.destroy()

        delete three.mathbox
        delete @context.api.three
        delete @context

      object: () => @context?.scene.root

  uninstall: (three) ->
    three.MathBox.destroy()
    delete three.MathBox

  # Ready event: right before mathbox() / THREE.bootstrap() returns
  ready: (event, three) ->
    if @options.init
      three.MathBox.init()

      setTimeout () =>
        @inspect three if @options.inspect

  # Log scene for inspection
  inspect: (three) ->
    @context.api.inspect()
    @info() if !@options.warmup

  info: (three) ->
    fmt = (x) ->
      out = []
      while x >= 1000
        out.unshift ("000" + (x % 1000)).slice(-3)
        x = Math.floor(x / 1000)
      out.unshift x
      out.join ','

    info = three.renderer.info.render
    console.log('Geometry  ',
                fmt(info.faces) + ' faces  ',
                fmt(info.vertices) + ' vertices  ',
                fmt(info.calls) + ' draw calls  ');

  # Warmup progress changed
  progress: (remain, three) ->
    return unless remain or @pending

    # Latch max value until queue is emptied to get a total
    pending = Math.max remain + @options.warmup, @pending
    pending = 0 if remain == 0

    # Check if changed
    if @remain != remain or @pending != pending
      @pending = pending
      @remain  = remain

      # Send events for external progress reporting
      current = pending - remain
      total   = pending
      three.trigger {type: 'mathbox.progress', current: pending - remain, total: pending}

      # Update splash screen
      @updateSplash current, total if @splash

      # Report once when loaded
      if current == 0 and !@warm
        @warm = true
        @info three if @options.inspect

  # Update splash screen state and animation
  updateSplash: (current, total) ->

    # Display splash screen
    visible = current > 0
    @splashElement.display = if visible then 'block' else 'none'

    # Update splash progress
    width = if pending then Math.round(100 * current / total) + '%' else '100%'
    @splashProgress.width = width

    # Spinny gyros
    weights = @splashRandom

    # Lerp clock speed
    f = Context.Namespace.Util.Ease.clamp three.Time.now - @splashStart, 0, 1
    increment = (transform, j = 0) ->
      transform.replace /([0-9.]+)deg/g, (_, n) -> (+n + weights[j++] * f) + 'deg'

    for el, i in @splashGyro
      @splashForms[i] = t = increment @splashForms[i]
      el.style.transform = el.style.WebkitTransform = t

  # Default splash screen
  makeSplash: (three) ->
    {color} = @options
    html = """
    <div class="mathbox-loader mathbox-splash-#{color}">
      <div class="mathbox-logo">
        <div> <div></div><div></div><div></div> </div>
        <div> <div></div><div></div><div></div> </div>
      </div>
      <div class="mathbox-progress"><div></div></div>
    </div>
    """

    div = document.createElement 'div'
    div.innerHTML = html
    three.element.appendChild div

    @splash         = div
    @splashElement  = div.querySelector   ('.mathbox-loader')        .style
    @splashProgress = div.querySelector   ('.mathbox-progress > div').style
    @splashGyro     = div.querySelectorAll('.mathbox-logo > div')
    @splashForms    = [
      "rotateZ(22deg) rotateX(24deg) rotateY(30deg)"
      "rotateZ(11deg) rotateX(12deg) rotateY(15deg) scale3d(.6, .6, .6)"
    ]
    @splashRandom   = [Math.random(), Math.random(), Math.random()]
    @splashStart    = three.Time.now

  # Hook up context events
  resize: (event, three) ->
    @context?.resize three.Size

  pre: (event, three) ->
    @context?.pre(three.Time)

  update: (event, three) ->
    @context?.update()

    if (camera = @context?.camera) and
       camera != three.camera

      three.camera = camera

    three.Time.set {speed: @context.speed}

    @progress @context.getPending(), three

  render: (event, three) ->
    @context?.render()

  post: (event, three) ->
    @context?.post()
