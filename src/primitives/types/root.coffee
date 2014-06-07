Group = require './group'

class Root extends Group

  constructor: (model, context, helpers) ->
    super model, context, helpers

    @visible = true

  transform: (shader) ->
    shader.call 'view.position'

module.exports = Root