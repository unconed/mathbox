Overlay    = require './overlay'
Model      = require './model'
Primitives = require './primitives'
Render     = require './render'
Shaders    = require './shaders'
Stage      = require './stage'
Util       = require './util'

class Context
  # Export for extending
  @Namespace =
    Model:      Model
    Stage:      Stage
    Render:     Render
    Shaders:    Shaders
    Primitives: Primitives
    Util:       Util

  # Set up entire environment
  constructor: (renderer, scene = null, camera = null, script = []) ->

    # DOM container
    @canvas      = canvas  = renderer.domElement
    @element     = element = canvas.parentNode

    # Rendering factory
    @shaders     = new Shaders.Factory              Shaders.Snippets
    @renderables = new Render .Factory    renderer, Render .Classes, @shaders
    @overlays    = new Overlay.Factory    element,  canvas, Overlay.Classes
    @scene       = @renderables.make      'scene',  scene: scene
    @camera      = @renderables.make      'camera', camera: camera

    # Primitives factory
    @attributes  = new Model.Attributes   Primitives.Types
    @primitives  = new Primitives.Factory Primitives.Types, @
    @root        = @primitives.make       'root'

    # Document model
    @model       = new Model.Model        @root
    @guard       = new Model.Guard

    # Scene controllers
    @controller  = new Stage.Controller   @model, @primitives
    @animator    = new Stage.Animator     @model
    @director    = new Stage.Director     @controller, @animator, script

    # Public API
    @api         = new Stage.API          @

    # Debug
    window.model = @model
    window.root  = @model.root

  init: () ->
    @scene.inject()
    @overlays.inject()

  destroy: () ->
    @scene.unject()
    @overlays.unject()

  resize: (size) ->
    @root.controller.resize size

  pre: () ->
    @root.controller.pre?()

  update: () ->
    @animator.update()

    @guard.iterate () =>
      change   = @attributes.digest()
      change ||= @model     .digest()

    @root.controller.update?()

  render: () ->
    @root.controller.render?()

  post: () ->
    @root.controller.post?()

module.exports = Context
