class Factory
  constructor: (@classes, @attributes, @renderables) ->

  getTypes: () ->
    Object.keys @classes

  make: (type, options) ->
    new @classes[type] options, @attributes, @renderables

module.exports = Factory