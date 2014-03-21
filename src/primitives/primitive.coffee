Model = require '../model'
helpers = require './helpers'

class Primitive
  @Node = Model.Node
  @Group = Model.Group

  @model  = @Node
  @traits = []

  constructor: (@model, @_attributes, @_factory, @_shaders) ->
    @model.primitive = @

    @model.on 'change', (event) =>
      @change event.changed if @root

    @model.on 'added', (event) =>
      @_added()

    @model.on 'removed', (event) =>
      @_removed()

    @inherited = []

    @_helper = helpers @
    @_get = @model.get.bind @model

  # Construction of renderables

  rebuild: () ->
    if @root
      @unmake()
      @make()
      @change {}, true

  make: () ->
  unmake: () ->

  # Transform pipeline
  transform: (shader) ->
    @parent?.transform shader

  # Add/removal callback
  _added: () ->
    @root = @model.root
    @parent = @model.parent.primitive

    @make()
    @change {}, true

  _removed: () ->
    @root = null

  # Emit/withdraw renderable
  _render: (renderable) ->
    @trigger
      type: 'render'
      renderable: renderable

  _unrender: (renderable) ->
    @trigger
      type: 'unrender'
      renderable: renderable

  # Attribute changes

  _change: (changed) ->

  _listen: (object, key) ->
    return if object == @

    handler = (event) =>
      changed = event.changed
      @_change changed if @root and changed[key]?
    object.model.on 'change', handler

    inherited = [object, handler]
    @inherited.push inherited

  _unlisten: (inherited) ->
    [object, handler] = inherited
    object.model.off 'change', handler

  # Attribute inheritance
  _inherit: (key, target = @) ->

    if @_get(key)?
      target._listen @, key
      return @model

    if @parent?
      @parent._inherit key, target
    else
      null

  _unherit: () ->
    @_unlisten(inherited) for inherited in @inherited
    @inherited = []

  # Find attached data model
  _attached: (key, klass) ->
    object = @_get key
    return object if object instanceof klass


THREE.Binder.apply Primitive::

module.exports = Primitive
