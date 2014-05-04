Group = require './group'

class Root extends Group
  constructor: (model, attributes, renderables, shaders, helper) ->
    super model, attributes, renderables, shaders, helper

    @visible = true

  transform: (shader) ->
    shader.call 'view.position'

module.exports = Root