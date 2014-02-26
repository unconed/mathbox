class Primitive
  constructor: (options, attributes, @_factory) ->
    @_attributes = attributes.apply(@, @traits)
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

  _removed: () ->
    @_unmake()
    @root = @parent = null

  _extend: () ->
    @traits ?= []
    @traits = [].concat.apply @traits, arguments

  _render: (object) ->
    @trigger
      type: 'render'
      object: object

  _unrender: (object) ->
    @trigger
      type: 'unrender'
      object: object

THREE.Binder.apply Primitive::

module.exports = Primitive
