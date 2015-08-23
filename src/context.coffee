Model      = require './model'
Overlay    = require './overlay'
Primitives = require './primitives'
Render     = require './render'
Shaders    = require './shaders'
Stage      = require './stage'
Util       = require './util'

class Context
  # Export for extending
  @Namespace = { Model, Overlay, Primitives, Render, Shaders, Stage, Util, DOM: Util.VDOM.Types }

  # Set up entire environment
  constructor: (renderer, scene = null, camera = null) ->

    # DOM container
    @canvas      = canvas  = renderer.domElement
    @element     = element = canvas.parentNode

    # Rendering factory
    @shaders     = new Shaders.Factory    Shaders.Snippets
    @renderables = new Render .Factory    Render .Classes, renderer, @shaders
    @overlays    = new Overlay.Factory    Overlay.Classes, element,  canvas

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

    # Global clock
    @time        = { now: +new Date() / 1000, clock: 0, step: 0 }

  init: () ->
    @scene.inject()
    @overlays.inject()

  destroy: () ->
    @scene.unject()
    @overlays.unject()

  resize: (size) ->
    @root.controller.resize size

  pre: (time) ->
    @time = time if time?
    @root.controller.pre?()

  update: () ->

    @attributes.compute()
    @animator.update @time

    @guard.iterate
      step: () =>
        change   = @attributes.digest()
        change ||= @model     .digest()
      last: () ->
        {attribute: @attributes.getLastTrigger(), model: @attributes.getLastTrigger()}

    @root.controller.update?()

    @camera = @root.controller.getCamera()

  render: () ->
    @root.controller.render?()

  post: () ->
    @root.controller.post?()

  warmup: () ->
    @scene.warmup()

module.exports = Context
