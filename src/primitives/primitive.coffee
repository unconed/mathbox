class Primitive
  constructor: (options, @_attributes, @_factory) ->
    @attributes = @_attributes.apply(@, @traits)
    @parent = null
    @root = null
    @set options, null, true

    @on 'change', (event) =>
      @_change event.changed if @root

  rebuild: () ->
    if @root
      @_unmake()
      @_make()

  _make: () ->
  _unmake: () ->

  _change: (changed) ->

  _inherit: (trait) ->
    object = @
    while object
      return object if trait in object.traits
      object = object.parent
    null

  _added: (parent) ->
    @parent = parent
    @root = parent.root
    @_make()
    @_change {}

  _removed: () ->
    @_unmake()
    @root = @parent = null

  _extend: () ->
    @traits ?= []
    @traits = [].concat.apply @traits, arguments

  _render: (renderable) ->
    @trigger
      type: 'render'
      renderable: renderable

  _unrender: (renderable) ->
    @trigger
      type: 'unrender'
      renderable: renderable

THREE.Binder.apply Primitive::

module.exports = Primitive
