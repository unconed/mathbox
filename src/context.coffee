Model      = require './model'
Stage      = require './stage'
Render     = require './render'
Shaders    = require './shaders'
Primitives = require './primitives'
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
  constructor: (renderer, scene, camera, script = []) ->

    # Rendering factory
    @shaders     = new Shaders.Factory    Shaders.Snippets
    @renderables = new Render.Factory     renderer, Render.Classes, @shaders
    @scene       = @renderables.make      'scene', scene: scene, camera: camera

    # Primitives factory
    @attributes  = new Model.Attributes   Primitives.Types
    @primitives  = new Primitives.Factory Primitives.Types, @
    @root        = @primitives.make       'root'

    # Document model
    @model       = new Model.Model        @root

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

  destroy: () ->
    @scene.unject()

  resize: (size) ->
    @root.primitive.resize size

  update: () ->
    @animator  .update()
    @attributes.digest()
    @model     .digest()

    @root.primitive.update()

module.exports = Context
