Model      = require './model'
Stage      = require './stage'
Render     = require './render'
Shaders    = require './shaders'
Primitives = require './primitives'
Util       = require './util'

class Context
  # Export for tinkering
  @Namespace =
    Model:      Model
    Stage:      Stage
    Render:     Render
    Shaders:    Shaders
    Primitives: Primitives
    Util:       Util

  # Public interface
  constructor: (gl, scene, camera, script = []) ->

    # Rendering factory
    @shaders     = new Shaders.Factory    Shaders.Snippets
    @renderables = new Render.Factory     gl, Render.Classes, @shaders
    @scene       = new Render.Scene       scene

    # Primitives factory
    @attributes  = new Model.Attributes   Primitives.Types
    @primitives  = new Primitives.Factory Primitives.Types, @

    # Document model
    @root        = @primitives.make 'root'
    @model       = new Model.Model        @root

    # Scene controllers
    @controller  = new Stage.Controller   @model, @primitives
    @animator    = new Stage.Animator     @model
    @director    = new Stage.Director     @controller, @animator, script

    # Public API
    @api         = new Stage.API          @controller, @animator, @director

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

    @root.primitive.update()

module.exports = Context
