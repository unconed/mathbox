Util = require '../util'

class Controller
  constructor: (@model, @primitives) ->

  getRoot: () ->
    @model.getRoot()

  getTypes: () ->
    @primitives.getTypes()

  make: (type, options, binds) ->
    @primitives.make type, options, binds

  get: (node, key) ->
    node.get(key)

  set: (node, key, value) ->
    try
      node.set key, value
    catch e
      node.print null, 'warn'
      console.error e

  bind: (node, key, expr) ->
    try
      node.bind key, expr
    catch e
      node.print null, 'warn'
      console.error e

  unbind: (node, key) ->
    try
      node.unbind key
    catch e
      node.print null, 'warn'
      console.error e

  add: (node, target = @model.getRoot()) ->
    target.add node

  remove: (node) ->
    target = node.parent
    target.remove node if target

module.exports = Controller