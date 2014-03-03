class Primitive
  constructor: (options, @_attributes, @_factory) ->
    @attributes = @_attributes.apply @, @traits
    @parent = null
    @root = null
    @inherited = []
    @traits ?= []
    @set options, null, true

    @on 'change', (event) =>
      @_change event.changed if @root

  # Construction of renderables

  rebuild: () ->
    if @root
      @_unmake()
      @_make()
      @_change {}, true

  _make: () ->
  _unmake: () ->

  # Add/removal callback
  _added: (parent) ->
    @parent = parent
    @root = parent.root
    @_make()
    @_change {}, true

  _removed: () ->
    @_unmake()
    @root = @parent = null

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

  # Traits (groups of attributes)
  _traits: () ->
    @traits ?= []
    @traits = [].concat.apply @traits, arguments

  # Attribute changes

  _change: (changed) ->

  _listen: (object, key) ->
    return if object == @

    handler = (event) =>
      changed = event.changed
      @_change changed if @root and changed[key]?
    object.on 'change', handler

    inherited = [object, handler]
    @inherited.push inherited

  _unlisten: (inherited) ->
    [object, handler] = inherited
    object.off 'change', handler

  # Attribute inheritance
  _inherit: (key, target = @) ->

    if @get(key)?
      target._listen @, key
      return @

    if @parent?
      @parent._inherit key, target
    else
      null

  _unherit: () ->
    @_unlisten(inherited) for inherited in @inherited
    @inherited = []

THREE.Binder.apply Primitive::

module.exports = Primitive
