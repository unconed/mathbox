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

  apply: (object, traits = []) ->
    new Data object, traits, @

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
  constructor: (object, traits = [], attributes) ->

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
      throw "Setting unknown property '#{key}'" unless validators[key]?

      attr = @[key]

      # Validate new value
      valid   = true
      replace = validate key, value, attr.last, () -> valid = false; null
      replace = attr.last if replace == undefined

      # Accept and insert into flattened/original list
      if valid
        [attr.value, attr.last] = [replace, attr.value]

        short = attr.short
        flattened[short] = replace
        originals[short] = value

        # Compare to last value
        change key, value unless ignore or equals key, attr.value, attr.last

      return valid

    object.get = (key, original) =>
      if key? and key != true
        if original then originals[to(key)] else get(key)
      else
        if key or original then originals else flattened

    object.set = (key, value, ignore) ->
      if key? and value?
        set(key, value, ignore)
      else
        options = key
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
        attributes.queue digest

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

    # Add in traits
    list   = []
    values = {}
    for trait in traits
      [trait, ns] = trait.split ':'
      name = if ns then [ns, trait].join '.' else trait
      spec = attributes.getTrait trait
      list.push trait

      continue unless spec

      for key, options of spec
        key = [name, key].join '.'
        short = shorthand key

        # Make attribute object
        @[key] = attr =
          short: short
          enum:  options.enum?()
          type:  options.uniform?()
          last:  options.make()
          value: value = options.make()

        # Define flat namespace alias
        define key, short
        flattened[short] = value

        # Collect makers, validators and comparators
        makers[key]      = options.make
        validators[key]  = options.validate ?    (v) -> v
        equalors[key]    = options.equals   ? (a, b) -> a == b

    # Store array of traits
    unique = list.filter (object, i) -> list.indexOf(object) == i
    object.traits = unique

    null

module.exports = Attributes
