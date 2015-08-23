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
  constructor: (definitions, @context) ->
    @traits  = definitions.Traits
    @types   = definitions.Types
    @pending = []
    @bound   = []
    @last    = null

  make: (type) ->
    enum:  type.enum?()
    type:  type.uniform?() # for three.js
    value: type.make()

  apply: (object, traits = [], props = {}, freeform = false) ->
    new Data object, traits, props, freeform, @

  bind:   (callback) -> @bound.push callback
  unbind: (callback) -> @bound = (cb for cb in @bound when cb != callback)

  queue: (callback, object, key, value) ->
    @lastObject = object
    @lastKey    = key
    @lastValue  = value
    @pending.push callback

  compute: () ->
    cb @context.time.clock, @context.time.delta for cb in @bound if @bound.length
    return

  digest: () ->
    return false if !@pending.length

    [calls, @pending] = [@pending, []]
    callback() for callback in calls

    true

  getTrait: (name) ->
    @traits[name]

  getLastTrigger: () -> "#{@lastObject.toString()} - #{@lastKey}=`#{@lastValue}`"


class Data
  constructor: (object, traits = [], props, freeform, _attributes) ->

    @object = object

    # Save existing (original) values if re-applying
    oldProps = object.props      if object.set?  and object.get? and object.orig?
    oldOrig  = object.orig()     if object.set?  and object.get? and object.orig?
    oldExpr  = object.expr       if object.bind? and object.unbind?
    oldReads = object.readonly() if object.bind? and object.unbind?

    # Dispose of old attributes/bindings
    object.attributes?.dispose()

    # Flattened and original values
    flattened = {}
    originals = {}

    # Aliases
    mapTo = {}
    to   = (name) -> mapTo[name]   ? name
    define = (name, alias) ->
      throw new Error "#{object.toString()} - Duplicate property `#{alias}`" if mapTo[alias]
      mapTo[alias]  = name

    # Get/set
    get = (key) => @[key]?.value ? @[to(key)]?.value
    set = (key, value, ignore, initial) =>
      key = to(key)

      # Look for defined attribute
      unless (attr = @[key])?
        throw new Error "#{object.toString()} - Setting unknown property `#{key}={#{value}}`" unless freeform

        # Define attribute on the fly (placeholder)
        attr = @[key] =
          short: key
          type:  null
          last:  null
          value: null
        validators[key] = (v) -> v

      if !ignore
        # See if prop isn't bound
        if expr[key]
          throw new Error "#{object.toString()} - Setting bound property `#{key}={#{value}}`"

        # See if prop isn't readonly
        if reads[key]
          throw new Error "#{object.toString()} - Setting readonly property `#{key}={#{value}}`"

      # Validate new value
      valid = true
      validated = validate key, value, attr.last, () -> valid = false; null

      # Accept and insert into flattened/original list
      if valid
        [attr.value, attr.last] = [validated, attr.value]

        # Remember in flattened dict
        short = attr.short
        flattened[short] = validated
        originals[short] = value if !ignore # Remember original unvalidated value

        # Compare to last value unless setting initial value
        change key, value unless initial or equals key, attr.value, attr.last

      return valid

    # Expression binding
    bound = {}
    expr  = {}
    reads = {}

    bind = (key, _expr, readonly = false) ->
      if typeof _expr != 'function'
        throw new Error "#{object.toString()} - Expression `#{key}=>{#{expr}}` is not a function"
      if expr[key]
        throw new Error "#{object.toString()} - Property `#{key}=>{#{expr}}` is already bound"
      if readonly[key]
        throw new Error "#{object.toString()} - Property `#{key}` is read-only"

      reads[key] = _expr if readonly
      expr[key]  = _expr if !readonly

      _expr = _expr.bind object
      bound[key] = (t, d) -> object.set key, _expr(t, d), true
      _attributes.bind bound[key]

    unbind = (key, readonly = false) ->
      return unless (if readonly then expr[key] else reads[key])
      _attributes.unbind bound[key]
      delete bound[key]
      delete expr[key]
      delete reads[key]

    # Public interface
    object.readonly = () ->
      out = {}
      out[k] = v for k,v of reads
      out

    object.expr  = expr
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

    object.set = (key, value, ignore, initial) ->
      if typeof key == 'string'
        set(key, value, ignore, initial)
      else
        initial = ignore
        ignore  = value
        options = key
        set(key, value, ignore, initial) for key, value of options
      return

    object.bind = (key, expr, readonly) ->
      if typeof key == 'string'
        bind(key, expr, readonly)
      else
        readonly = expr
        binds = key
        bind(key, expr, readonly) for key, expr of binds

    object.unbind = (key, readonly) ->
      if typeof key == 'string'
        unbind(key, readonly)
      else
        unbind(key, readonly) for key of expr

    object.attribute = (key) => @[to(key)]

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
      target = validate key, value, target, () ->
        throw new Error "#{object.toString()} - Invalid value `#{key}={#{value}}`"

    # Accumulate changes
    dirty = false
    changed = {}
    touched = {}
    getNS  = (key) -> key.split('.')[0]
    change = (key, value) =>
      if !dirty
        dirty = true
        _attributes.queue digest, key, value

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
          T:     type
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
        validators[key]  = type.validate ? (a) -> a
        equalors[key]    = type.equals ? (a, b) -> a == b

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
    object.set oldProps, true,  true if oldProps?
    object.set oldOrig,  false, true if oldOrig?

    # Bind previous expressions if applicable
    object.bind oldReads, true if oldReads?
    object.bind oldExpr, false if oldExpr?

    # Destructor
    @dispose = () ->
      unbind(key, true)  for key of reads
      unbind(key, false) for key of expr

    null


module.exports = Attributes
