cssauron = require 'cssauron'

class Model
  constructor: (@root) ->
    @root.model = @
    @root.root  = @root

    @ids      = {}
    @classes  = {}
    @types    = { root: [@root] }
    @nodes    = []

    @event = type: 'update'

    # Prepare CSSauron
    @language =
      cssauron
        tag:      'type'
        id:       'id'
        class:    "classes.join(' ')"
        parent:   'parent'
        children: 'children'

    # Track object lifecycle
    add = (event) =>
      object = event.object
      adopt object
      update event, object, true

    remove = (event) =>
      object = event.object
      dispose object

    # Triggered by child addition/removal
    @root.on 'add',    add
    @root.on 'remove', remove

    adopt = (object) =>
      addNode object
      addType object
      object.on 'change:node', update

    dispose = (object) =>
      removeNode object
      removeType object
      removeID      object.id
      removeClasses object.classes
      object.off 'change:node', update

    # Track id/class changes
    update = (event, object, force) =>
      _id    = force or event.changed['node.id']
      _klass = force or event.changed['node.classes']

      if _id
        id = object.get 'node.id'
        if id != object.id
          removeID object.id, object
          addID    id,        object

      if _klass
        classes = object.get 'node.classes'
        klass = classes.join ','
        if klass != object.klass
          removeClasses object.classes, object
          addClasses    classes,        object
          object.klass   = klass
          object.classes = classes.slice()

    addID = (id, object) =>
      if @ids[id]
        throw "Duplicate id `#{id}`"

      @ids[id] = object if id
      object.id = id

    removeID = (id, object) =>
      if id?
        delete @ids[id]
      delete object.id

    addClasses = (classes, object) =>
      if classes?
        for k in classes
          list = @classes[k] ? []
          list.push object
          @classes[k] = list

    removeClasses = (classes, object) =>
      if classes?
        for k in classes
          list = @classes[k]
          index = list.indexOf object
          list.splice index, 1 if index >= 0
          if list.length == 0
            delete @classes[k]

    # Track nodes and types
    addNode = (object) =>
      @nodes.push object

    removeNode = (object) =>
      @nodes.splice @nodes.indexOf(object), 1

    # Track objects by type
    addType = (object) =>
      type = object.type
      list = @types[type] ? []
      list.push object
      @types[type] = list

    removeType = (object) =>
      type = object.type
      list = @types[type] ? []
      index = list.indexOf object
      list.splice index, 1 if index >= 0
      if list.length == 0
        delete @types[type]

  # Querying via CSS selectors

  # Filter array by selector
  filter: (nodes, selector) ->
    selector = @language selector
    node for node in nodes when selector(node)

  # Filter array by ancestry
  ancestry: (nodes, parents) ->
    out = []
    for node in nodes
      parent = node.parent
      while parent?
        if parent in parents
          out.push node
          continue
        parent = node.parent
    out

  # Apply (scoped) selector to model
  select: (selector, parents) ->
    matches = []
    matches = matches.concat @_select s for s in selector.split /,/g
    unique = matches.filter (object, i) -> matches.indexOf(object) == i
    unique = @ancestry unique, parents if parents?
    return unique

  # Query single selector
  _select: (s) ->
    # Trim
    s = s.replace /^\s+/, ''
    s = s.replace /\s+$/, ''

    # Universal selector *
    return @nodes if s == '*'

    # Check for simple #id, .class or type selector
    id    = s.match /^#([A-Za-z0-9_]+)$/
    return        @ids[id[1]] || [] if id

    klass = s.match /^\.([A-Za-z0-9_]+)$/
    return @classes[klass[1]] || [] if klass

    type  = s.match /^[A-Za-z0-9_]+$/
    return    @types[type[0]] || [] if type

    # Otherwise iterate over everything
    @filter @nodes, s

  getRoot: () ->
    @root

THREE.Binder.apply Model::

module.exports = Model