Stage = require('./stage')
Render = require('./render')
Primitives = require('./primitives')

class Context
  constructor: (scene, camera, script = []) ->

    # Primitives

    @attributes = new Primitives.Attributes Primitives.Types.Traits
    @factory = new Primitives.Factory Primitives.Types.Classes, @attributes

    # Stage: model + controllers

    @model = new Stage.Model @factory.make('root'), camera
    @animator = new Stage.Animator @model
    @controller = new Stage.Controller @model
    @director = new Stage.Director @controller, @animator, script

    # Renderables

    @scene = new Render.Scene scene, camera
#    @render = new Render.Render @scene

    # External API

    @api = new Stage.API @controller, @animator, @director, @factory

  init: () ->
    @scene.init()

  destroy: () ->
    @scene.destroy()
    @model = @animator = @controller = @director = @factory = @api = null

  update: () ->
    @animator.update()
    @attributes.digest()

exports.Context = Context
