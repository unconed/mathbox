Stage = require('./stage')
Render = require('./render')
Primitives = require('./primitives')

class Context
  constructor: (gl, scene, camera, script = []) ->

    @renderables = new Render.Factory gl, Render.Types.Classes
    @scene       = new Render.Scene scene

    @attributes  = new Primitives.Attributes Primitives.Types.Traits
    @primitives  = new Primitives.Factory Primitives.Types.Classes, @attributes, @renderables

    @model       = new Stage.Model camera
    @controller  = new Stage.Controller @model, @scene, @primitives
    @animator    = new Stage.Animator @model
    @director    = new Stage.Director @controller, @animator, script

    @api         = new Stage.API @controller, @animator, @director

  init: () ->
    @scene.inject()

  destroy: () ->
    @scene.unject()

  update: () ->
    @animator.update()
    @attributes.digest()

module.exports = Context
