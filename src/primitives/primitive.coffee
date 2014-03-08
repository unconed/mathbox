Model = require '../model'

class Primitive
  @Node = Model.Node
  @Group = Model.Group

  @model  = @Node
  @traits = []

  constructor: (@model, @_attributes, @_factory) ->
    @model.primitive = @

    @model.on 'change', (event) =>
      @_change event.changed if @root

    @model.on 'added', (event) =>
      @_added()

    @model.on 'removed', (event) =>
      @_removed()

    @inherited = []

  # Construction of renderables

  rebuild: () ->
    if @root
      @_unmake()
      @_make()
      @_change {}, true

  _make: () ->
  _unmake: () ->

  # Add/removal callback
  _added: () ->
    @root = @model.root
    @parent = @model.parent.primitive

    @_make()
    @_change {}, true

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

  # Transform pipeline
  _transform: (shader) ->
    @parent?._transform shader

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

    if @model.get(key)?
      target._listen @, key
      return @model

    if @parent?
      @parent._inherit key, target
    else
      null

  _unherit: () ->
    @_unlisten(inherited) for inherited in @inherited
    @inherited = []

THREE.Binder.apply Primitive::

module.exports = Primitive
