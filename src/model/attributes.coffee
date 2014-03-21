###
 Custom attribute model
 - Organizes attributes by trait/namespace so the usage in code is organized
 - Provides shorthand aliases to access via simpler flat namespace API
 - Values are stored in three.js uniform-style objects by reference
 - Types avoid copying value objects on set
 - Coalesces update notifications per object and per trait
 
  Actual type and trait definitions are injected from Primitives
###

class Attributes
  constructor: (@traits, @types) ->
    @pending = []

  make: (type) ->
    type: type.uniform?()
    value: type.make()

  getSpec: (name) ->
    @traits[name]

  queue: (callback) ->
    @pending.push callback

  apply: (object, traits = []) ->
    new Data object, traits, @

  digest: () ->
    limit = 10

    while @pending.length > 0 && --limit > 0
      [calls, @pending] = [@pending, []]
      callback() for callback in calls

    if limit == 0
      console.error 'While digesting: ', object
      throw Error("Infinite loop in Data::digest")

    return


class Data
  constructor: (object, traits = [], attributes) ->

    # Aliases
    mapTo = {}
    mapFrom = {}
    to   = (name) -> mapTo[name]   ? name
    from = (name) -> mapFrom[name] ? name
    define = (name, alias) ->
      throw "Duplicate property `#{alias}`" if mapTo[alias]
      mapFrom[name] = alias
      mapTo[alias]  = name

    # Get/set
    get = (key) =>
      key = to(key)
      @[key]?.value
    set = (key, value, ignore) =>
      key = to(key)
      return unless validators[key]?

      replace = validate key, value, @[key].value
      @[key].value = replace if replace != undefined
      change key if !ignore

    object.get = (key) =>
      if key?
        get(key)
      else
        out = {}
        out[from(key)] = value.value for key, value of @
        out

    object.set = (key, value, ignore) ->
      if key? and value?
        set(key, value, ignore)
      else
        options = key
        set(key, value, ignore) for key, value of options
      return

    # Validate
    makers = {}
    validators = {}
    validate = (key, value, target) ->
      validators[key] value, target
    object.validate = (key, value) ->
      make = makers[key]
      target = make() if make?
      replace = validate key, value, target
      if replace != undefined then replace else target

    # Coalesce changes
    dirty = false
    changes = {}
    change = (key) =>
      if !dirty
        dirty = true
        attributes.queue digest

      # Log change
      changes[key] = true

      # Mark trait/namespace as dirty
      trait = key.split('.')[0]
      changes[trait] = true

    event =
      type: 'change'
      changed: null

    digest = () ->
      event.changed = changes
      changes = {}
      dirty = false

      object.trigger event

    shorthand = (name) ->
      parts = name.split /\./g
      suffix = parts.pop()
      parts.pop() # Discard
      parts.unshift suffix
      parts.reduce (a, b) -> a + b.charAt(0).toUpperCase() + b.substring(1)

    # Add in traits
    values = {}
    for trait in traits
      [trait, name] = trait.split ':'
      name ?= trait
      spec = attributes.getSpec trait
      for key, options of spec
        key = [name, key].join '.'
        @[key] =
          type: options.uniform?()
          value: options.make()

        define key, shorthand key

        makers[key] = options.make
        validators[key] = options.validate

module.exports = Attributes
