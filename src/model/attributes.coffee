###
 Custom attribute model
 - Organizes attributes by trait
 - Provides shorthand aliases to access via flat namespace API .get(key)
 - Provides constant-time .get() access to flat dictionary
 - Originally passed values are preserved and can be fetched via .get(true), .get(key, true)
 - Values are stored in three.js uniform-style objects so they can be bound as GL uniforms
 - Type validators and setters avoid copying value objects on write
 - Value is double-buffered to detect changes and nops
 - Coalesces update notifications per object and per trait
 
  Actual type and trait definitions are injected from Primitives
###

class Attributes
  constructor: (definitions) ->
    @traits  = definitions.Traits
    @types   = definitions.Types
    @pending = []

  make: (type) ->
    enum:  type.enum?()
    type:  type.uniform?() # for three.js
    value: type.make()

  apply: (object, traits = [], props = {}, freeform = false) ->
    new Data object, traits, props, freeform, @

  queue: (callback) ->
    @pending.push callback

  digest: () ->
    return false if !@pending.length
    [calls, @pending] = [@pending, []]
    callback() for callback in calls
    true

  getTrait: (name) ->
    @traits[name]


class Data
  constructor: (object, traits = [], props, freeform, _attributes) ->

    # Save existing (original) values if re-applying
    old = object.props if object.set? and object.get? and object.orig?

    # Flattened and original values
    flattened = {}
    originals = {}

    # Aliases
    mapTo = {}
    to   = (name) -> mapTo[name]   ? name
    define = (name, alias) ->
      throw "Duplicate property `#{alias}`" if mapTo[alias]
      mapTo[alias]  = name

    # Get/set
    get = (key) => @[key]?.value ? @[to(key)]?.value
    set = (key, value, ignore) =>
      key = to(key)

      # Look for defined attribute
      unless (attr = @[key])?
        throw "Setting unknown property '#{key}'" unless freeform

        # Define attribute on the fly
        attr = @[key] =
          short: key
          type:  null
          last:  null
          value: null
        validators[key] = (v) -> v

      # Validate new value
      valid   = true
      replace = validate key, value, attr.last, () -> valid = false; null
      replace = attr.last if replace == undefined

      # Accept and insert into flattened/original list
      if valid
        [attr.value, attr.last] = [replace, attr.value]

        short = attr.short
        flattened[short] = replace
        originals[short] = value   if !ignore

        # Compare to last value
        change key, value unless ignore or equals key, attr.value, attr.last

      return valid

    object.props = flattened

    object.orig = (key) =>
      if key?
        originals[to(key)]
      else
        originals

    object.get = (key) =>
      if key?
        get(key)
      else
        flattened

    object.set = (key, value, ignore) ->
      if typeof key == 'string'
        set(key, value, ignore)
      else
        options = key
        ignore  = value
        set(key, value, ignore) for key, value of options
      return

    # Validate value for key
    makers     = {}
    validators = {}
    equalors   = {}

    equals   = (key, value, target)          -> equalors[key]   value, target
    validate = (key, value, target, invalid) -> validators[key] value, target, invalid

    object.validate = (key, value) ->
      key  = to(key)
      make = makers[key]
      target = make() if make?
      replace = validate key, value, target, () -> throw "Invalid value for `#{key}`"
      if replace != undefined then replace else target

    # Accumulate changes
    dirty = false
    changed = {}
    touched = {}
    getNS  = (key) -> key.split('.')[0]
    change = (key, value) =>
      if !dirty
        dirty = true
        _attributes.queue digest

      trait = getNS key

      # Log change
      changed[key]   = true

      # Mark trait/namespace as dirty
      touched[trait] = true

    event =
      type: 'change'
      changed: null
      touched: null

    # Notify listeners of accumulated changes
    digest = () ->
      event.changed = changed
      event.touched = touched
      changes = {}
      touches = {}

      dirty = false

      event.type = 'change'
      object.trigger event

      for trait, dummy of event.touched
        event.type = "change:#{trait}"
        object.trigger event

    # Convert name.trait.key into keyName
    shorthand = (name) ->
      parts = name.split /\./g
      suffix = parts.pop()
      parts.pop() # Discard
      parts.unshift suffix
      parts.reduce (a, b) -> a + b.charAt(0).toUpperCase() + b.substring(1)

    # Define attributes for given trait spec by namespace
    addSpec = (name, spec) =>
      for key, type of spec
        key = [name, key].join '.'
        short = shorthand key

        # Make attribute object
        @[key] = attr =
          ns:    name
          short: short
          enum:  type.enum?()
          type:  type.uniform?()
          last:  type.make()
          value: value = type.make()

        # Define flat namespace alias
        define key, short
        flattened[short] = value

        # Collect makers, validators and comparators
        makers[key]      = type.make
        validators[key]  = type.validate ?    (v) -> v
        equalors[key]    = type.equals   ? (a, b) -> a == b

    # Add in traits
    list   = []
    values = {}
    for trait in traits
      [trait, ns] = trait.split ':'
      name = if ns then [ns, trait].join '.' else trait
      spec = _attributes.getTrait trait
      list.push trait

      addSpec name, spec if spec?

    # Add custom props by namespace
    if props?
      for ns, spec of props
        addSpec ns, spec

    # Store array of traits
    unique = list.filter (object, i) -> list.indexOf(object) == i
    object.traits = unique

    # Set previous values if applicable
    object.set old, true if old?

    null

module.exports = Attributes
