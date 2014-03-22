Group = require './group'

class Root extends Group
  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

    @visible = true

  transform: (shader) ->
    shader.call 'view.position'

module.exports = Root