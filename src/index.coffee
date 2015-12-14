# Global constructor
mathBox = (options) ->
  three = THREE.Bootstrap options

  if !three.fallback
    three.install 'time'                if !three.Time
    three.install ['mathbox', 'splash'] if !three.MathBox

  three.mathbox ? three

# Just because
window.π = Math.PI
window.τ = π * 2
window.e = Math.E

# Namespace
window.MathBox = exports
window.mathBox = exports.mathBox = mathBox
exports.version = '0.0.5'

# Load context and export namespace
exports.Context = Context = require './context'
exports[k] = v for k, v of Context.Namespace


# Splash screen plugin
require './splash'

# Threestrap plugin
THREE.Bootstrap.registerPlugin 'mathbox',
  defaults:
    init:    true
    warmup:  2
    inspect: true
    splash:  true

  listen: ['ready', 'pre', 'update', 'post', 'resize'],

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

        # v1 compatibility
        @context.api.start = () -> three.Loop.start()
        @context.api.stop  = () -> three.Loop.stop()

        # Initialize and set initial size
        @context.init()
        @context.resize three.Size

        # Set warmup mode and track pending objects
        @context.setWarmup @options.warmup
        @pending = 0
        @warm    = !@options.warmup

        console.log 'MathBox²', MathBox.version
        three.trigger {type: 'mathbox/init', version: MathBox.version, context: @context}

      # Destroy the mathbox context
      destroy: () =>
        return if !inited
        inited = false

        three.trigger {type: 'mathbox/destroy', context: @context}

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
    @info three if !@options.warmup

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

    # Call render here instead of on:render because it renders off screen material
    # that needs to be available for rendering the actual frame.
    @context?.render()

  post: (event, three) ->
    @context?.post()

  # Warmup progress changed
  progress: (remain, three) ->
    return unless remain or @pending

    # Latch max value until queue is emptied to get a total
    pending = Math.max remain + @options.warmup, @pending

    # Send events for external progress reporting
    current = pending - remain
    total   = pending
    three.trigger {type: 'mathbox/progress', current: pending - remain, total: pending}

    pending = 0 if remain == 0
    @pending = pending

    # Report once when loaded
    if current == total and !@warm
      @warm = true
      @info three if @options.inspect
