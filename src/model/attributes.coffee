###
 Custom attribute model
 - Organizes attributes by trait in .attributes
 - Provides constant-time .props / .get() access to flat dictionary
 - Provides .get(key) with or without trait namespaces
 - Change attributes with .set(key) or .set(dictionary)
 - Validation is double-buffered and in-place to detect changes and nops
 - Change notifications are coalesced per object and per trait, digested later
 - Values are stored in three.js uniform-style objects so they can be bound as GL uniforms
 - Originally passed (unnormalized) values are preserved and can be fetched via .orig()
 - Attributes can be defined as final/const
 - Attributes can be computed from both public or private expressions with .bind(key, false/true)
 - Expressions are time-dependent, can be time-travelled with .evaluate()
 - This enables continous simulation and data logging despite choppy animation updates
 
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

  apply: (object, config) ->
    new Data object, config, @

  bind:   (callback) -> @bound.push callback
  unbind: (callback) -> @bound = (cb for cb in @bound when cb != callback)

  queue: (callback, object, key, value) ->
    @lastObject = object
    @lastKey    = key
    @lastValue  = value
    @pending.push callback

  invoke: (callback) -> callback @context.time.clock, @context.time.step

  compute: () ->
    @invoke cb for cb in @bound if @bound.length
    return

  digest: () ->
    return false if !@pending.length

    [calls, @pending] = [@pending, []]
    callback() for callback in calls

    true

  getTrait: (name) ->
    @traits[name]

  getLastTrigger: () -> "#{@lastObject.toString()} - #{@lastKey}=`#{@lastValue}`"

shallowCopy = (x) ->
  out = {}
  out[k] = v for k, v of x
  out

class Data
  constructor: (object, config, _attributes) ->
    {traits, props, finals, freeform} = config
    data = @

    # Save existing (original) values if re-applying
    if object.props? and object.expr? and object.orig? and object.computed? and object.attributes?
      oldProps    = shallowCopy object.props
      oldExpr     = shallowCopy object.expr
      oldOrig     = object.orig()
      oldComputed = object.computed()

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
    get = (key) -> data[key]?.value ? data[to(key)]?.value
    set = (key, value, ignore, initial) ->
      key = to(key)

      # Look for defined attribute
      unless (attr = data[key])?
        throw new Error "#{object.toString()} - Setting unknown property `#{key}={#{value}}`" unless freeform

        # Define attribute on the fly (placeholder)
        attr = data[key] =
          short: key
          type:  null
          last:  null
          value: null
        validators[key] = (v) -> v

      if !ignore
        # See if prop isn't bound
        if _expr[key]
          throw new Error "#{object.toString()} - Can't set bound property `#{key}={#{value}}`"

        # See if prop isn't computed
        if _computed[key]
          throw new Error "#{object.toString()} - Can't set computed property `#{key}={#{value}}`"

        # See if prop isn't final
        if _finals[key]
          throw new Error "#{object.toString()} - Can't set final property `#{key}={#{value}}`"

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

    constant = (key, value, initial) ->
      key = to(key)

      set key, value, true, initial
      _finals[key] = true

    # Prop/expression binding
    expr     = {}

    _bound    = {}
    _eval     = {}
    _expr     = {}
    _computed = {}
    _finals   = {}

    bind = (key, expression, computed = false) ->
      key = to key

      if typeof expression != 'function'
        throw new Error "#{object.toString()} - Expression `#{key}=>{#{expr}}` is not a function"
      if _expr[key]
        throw new Error "#{object.toString()} - Property `#{key}=>{#{expr}}` is already bound"
      if _computed[key]
        throw new Error "#{object.toString()} - Property `#{key}` is computed"
      if _finals[key]
        throw new Error "#{object.toString()} - Property `#{key}` is final"

      list = if computed then _computed else _expr
      list[key] = expression

      short = if data[key]? then data[key].short else key
      expr[short] = expression if !computed # flattened
      _eval[key]  = expression

      expression  = expression.bind object
      _bound[key] = (t, d) ->
        if clock = object.clock?.getTime()
          t = clock.clock
          d = clock.step

        object.set key, expression(t, d), true
      _attributes.bind _bound[key]

    unbind = (key, computed = false) ->
      key = to key

      list = if computed then _computed else _expr
      return unless list[key]
      _attributes.unbind _bound[key]
      delete _bound[key]
      delete list[key]

      key = data[key].short if data[key]?
      delete expr[key]

    evaluate = (key, time) ->
      key = to key
      _eval[key]?(time, 0) ? data[key].value

    # Public interface
    object.expr  = expr
    object.props = flattened

    object.evaluate = (key, time) ->
      if key?
        evaluate(key, time)
      else
        out = {}
        out[key] = evaluate(key, time) for key of props
        out

    object.get = (key) -> if key? then get(key) else flattened

    object.set = (key, value, ignore, initial) ->
      if typeof key == 'string'
        set(key, value, ignore, initial)
      else
        initial = ignore
        ignore  = value
        options = key
        set(key, value, ignore, initial) for key, value of options
      return

    object.bind = (key, expr, computed) ->
      if typeof key == 'string'
        bind(key, expr, computed)
      else
        computed = expr
        binds = key
        bind(key, expr, computed) for key, expr of binds
      return

    object.unbind = (key, computed) ->
      if typeof key == 'string'
        unbind(key, computed)
      else
        computed = expr
        binds = key
        unbind(key, computed) for key of binds
      return

    object.attribute = (key) -> if key? then      data[to key] else data
    object.orig      = (key) -> if key? then originals[to key] else shallowCopy originals
    object.computed  = (key) -> if key? then _computed[to key] else shallowCopy _computed

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
    changes = {}
    touches = {}
    changed = {}
    touched = {}
    getNS  = (key) -> key.split('.')[0]
    change = (key, value) ->
      if !dirty
        dirty = true
        _attributes.queue digest, object, key, value

      trait = getNS key

      # Log change
      changes[key]   = true

      # Mark trait/namespace as dirty
      touches[trait] = true

    event =
      type: 'change'
      changed: null
      touched: null

    # Notify listeners of accumulated changes
    digest = () ->
      # Swap double buffered changes objects
      event.changed = changes
      event.touched = touches
      changes = changed
      touches = touched
      changed = event.changed
      touched = event.touched

      # Reset all dirty flags
      dirty = false
      changes[k] = false for k of changes
      touches[k] = false for k of touches

      event.type = 'change'
      object.trigger event

      for trait of event.touched
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
    addSpec = (name, spec) ->
      for key, type of spec
        key = [name, key].join '.'
        short = shorthand key

        # Make attribute object
        data[key] = attr =
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

    # Set previous internal values
    object.set  oldProps,    true,  true  if oldProps?

    # Set final props
    if finals?
      for key, value of finals
        constant key, value, true

    # Set previous external values
    object.set  oldOrig,     false, true  if oldOrig?

    # Bind previous computed props/expressions
    object.bind oldComputed, true         if oldComputed?
    object.bind oldExpr,     false        if oldExpr?

    # Destructor
    @dispose = () ->
      unbind(key, true)  for key of _computed
      unbind(key, false) for key of _expr
      props = {}
      delete object.attributes
      delete object.get
      delete object.set

    null


module.exports = Attributes
