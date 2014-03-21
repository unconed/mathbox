Group = require './group'

class Root extends Group
  @traits = ['object']

  transform: (shader) ->
    shader.call 'view.position'

module.exports = Root