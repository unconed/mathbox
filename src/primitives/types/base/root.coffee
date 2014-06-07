Parent = require './parent'

class Root extends Parent

  constructor: (model, context, helpers) ->
    super model, context, helpers

    @visible = true

  transform: (shader) ->
    shader.call 'view.position'

module.exports = Root