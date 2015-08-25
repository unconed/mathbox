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
      @inspect node, 'warn'
      console.error e

  bind: (node, key, expr) ->
    try
      node.bind key, expr
    catch e
      @inspect node, 'warn'
      console.error e

  unbind: (node, key) ->
    try
      node.unbind key
    catch e
      @inspect node, 'warn'
      console.error e

  add: (node, target = @model.getRoot()) ->
    target.add node

  remove: (node) ->
    target = node.parent
    target.remove node if target

  inspect: (node, level = 'info') ->
    Util.Pretty.print node.toMarkup()

module.exports = Controller