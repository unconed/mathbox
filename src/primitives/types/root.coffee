Group = require './group'

class Root extends Group
  @traits = ['object']

  _transform: (shader) ->
    shader.snippet 'worldToView'

module.exports = Root