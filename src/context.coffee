Model      = require './model'
Overlay    = require './overlay'
Primitives = require './primitives'
Render     = require './render'
Shaders    = require './shaders'
Stage      = require './stage'
Util       = require './util'

class Context
  # Export for extending
  @Namespace = { Model, Overlay, Primitives, Render, Shaders, Stage, Util, DOM: Util.VDOM }

  #-------------------------------------------------------------------

  # Set up entire environment
  constructor: (renderer, scene = null, camera = null) ->

    # DOM container
    @canvas      = canvas  = renderer.domElement
    @element     = null

    # Rendering factory
    @shaders     = new Shaders.Factory    Shaders.Snippets
    @renderables = new Render .Factory    Render .Classes, renderer, @shaders
    @overlays    = new Overlay.Factory    Overlay.Classes, canvas

    @scene       = @renderables.make      'scene',  scene: scene
    @camera      = @defaultCamera =       camera ? new THREE.PerspectiveCamera()

    # Primitives factory
    @attributes  = new Model.Attributes   Primitives.Types, @
    @primitives  = new Primitives.Factory Primitives.Types, @

    @root        = @primitives.make       'root'

    # Document model
    @model       = new Model.Model        @root
    @guard       = new Model.Guard

    # Scene controllers
    @controller  = new Stage.Controller   @model, @primitives
    @animator    = new Stage.Animator     @

    # Public API
    @api         = new Stage.API          @

    # Global clocks, one real-time and one adjustable
    @speed       = 1
    @time        = {
      now: +new Date() / 1000,
      time: 0,  delta: 0,
      clock: 0, step: 0
    }

  #-------------------------------------------------------------------
  # Lifecycle

  init: () ->
    @scene.inject()
    @overlays.inject()
    @

  destroy: () ->
    @scene.unject()
    @overlays.unject()
    @

  resize: (size) ->
    ###
    {
      viewWidth, viewHeight, renderWidth, renderHeight, aspect, pixelRatio
    }
    ###
    size ?= {}
    size.renderWidth  ?= size.viewWidth  ?= 1280
    size.renderHeight ?= size.viewHeight ?= 720
    size.pixelRatio   ?= size.renderWidth / Math.max .000001, size.viewWidth
    size.aspect       ?= size.viewWidth   / Math.max .000001, size.viewHeight

    @root.controller.resize size
    @

  frame: (time) ->
    ###
    {
      now, clock, step
    }
    ###
    @pre time
    @update()
    @render()
    @post()
    @

  #-------------------------------------------------------------------
  # Broken down update/render cycle, for manual scheduling/invocation

  pre: (time) ->
    if !time
      time = {
        now: +new Date() / 1000,
        time: 0,  delta: 0,
        clock: 0, step: 0
      }

      time.delta = if @time.now? then time.now - @time.now else 0

      # Check for stopped render loop, assume 1 60fps frame
      time.delta = 1 / 60 if time.delta > 1

      time.step  = time.delta * @speed
      time.time  = @time.time  + time.delta
      time.clock = @time.clock + time.step

    @time = time
    @root.controller.pre?()
    @

  update: () ->

    @animator.update()
    @attributes.compute()

    @guard.iterate
      step: () =>
        change   = @attributes.digest()
        change ||= @model     .digest()
      last: () ->
        {attribute: @attributes.getLastTrigger(), model: @model.getLastTrigger()}

    @root.controller.update?()

    @camera = @root.controller.getCamera()
    @speed  = @root.controller.getSpeed()

    @

  render: () ->
    @root.controller.render?()
    @scene.render()

    @

  post: () ->
    @root.controller.post?()
    @

  #-------------------------------------------------------------------
  # Warmup mode, inserts only n objects into the scene per frame
  # Will render objects to offscreen 1x1 buffer to ensure shader is compiled even if invisible
  setWarmup: (n) ->
    @scene.warmup n
    @

  getPending: () ->
    @scene.pending.length

module.exports = Context
