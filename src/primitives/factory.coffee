types = require('./types').types

class Factory
  constructor: () ->
    @types = types

  getTypes: () ->
    Object.keys @types

  make: (type, options) ->
    @types[type](options)

exports.Factory = Factory