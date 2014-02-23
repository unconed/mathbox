###
 Custom attribute model
 - Avoids copying objects when setting
 - Coalesces update notification per object
###

class Attributes
  constructor: (@traits) ->
    @pending = []

  getSpec: (name) ->
    @traits[name]

  queue: (callback) ->
    @pending.push callback

  apply: (object, traits = []) ->
    new Data object, traits, @

  digest: () ->
    [calls, @pending] = [@pending, []]
    callback() for callback in calls
    return

class Data
  constructor: (object, traits = [], attributes) ->

    # Get/set
    get = (key) => if key? then @[key] else @
    set = (key, value) =>
      replace = validate key, value, @[key]
      @[key] = replace if replace?
      change key

    object.get = get
    object.set = (key, value) ->
      if arguments.length >= 2
        set(key, value) if validators[key]?
      else
        options = key
        set(key, value) for key, value of options when validators[key]?
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
      if replace? then replace else target

    # Coalesce changes
    dirty = false
    changes = {}
    change = (key) =>
      if !dirty
        dirty = true
        attributes.queue digest

      changes[key] = @[key]

    digest = () ->
      changed = changes
      changes = {}
      dirty = false

      object.trigger
        type: 'change'
        changed: changed

    # Add in traits
    values = {}
    for trait in traits
      [trait, name] = trait.split ':'
      name ?= trait
      spec = attributes.getSpec trait
      for key, options of spec
        key = [name, key].join '.'
        @[key] = options.make()
        change key

        makers[key] = options.make
        validators[key] = options.validate

exports.Attributes = Attributes
