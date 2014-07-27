cssauron = require 'cssauron'

ALL   = '*'
ID    = /^#([A-Za-z0-9_])$/
CLASS = /^\.([A-Za-z0-9_]+)$/
TYPE  = /^[A-Za-z0-9_]+$/

###

  Model that wraps a root node and its children.
  
  Monitors adds, removals and ID/class changes.
  Enables CSS selectors, both querying and watching.

###
class Model
  constructor: (@root) ->
    @root.model = @
    @root.root  = @root

    @ids      = {}
    @classes  = {}
    @types    = { root: [@root] }
    @nodes    = []
    @watchers = []

    @event = type: 'update'

    # Prepare CSSauron
    @language =
      cssauron
        tag:      'type'
        id:       'id'
        class:    "classes.join(' ')"
        parent:   'parent'
        children: 'children'

    # Triggered by child addition/removal
    add    = (event) => adopt   event.node
    remove = (event) => dispose event.node

    @root.on 'add',    add
    @root.on 'remove', remove

    # Track node lifecycle
    adopt = (node) =>
      addNode node
      addType node
      node.on 'change:node', update
      update event, node, true
      inspect node, node

    dispose = (node) =>
      removeNode node
      removeType node
      removeID      node.id
      removeClasses node.classes
      node.off 'change:node', update
      inspect node

    inspect = (node, value) =>
      for watcher in @watchers.slice()
        watcher value if watcher.matcher node

    # Track id/class changes
    update = (event, node, force) =>
      _id    = force or event.changed['node.id']
      _klass = force or event.changed['node.classes']

      if _id
        id = node.get 'node.id'
        if id != node.id
          removeID node.id, node
          addID    id,      node

      if _klass
        classes = node.get 'node.classes'
        klass = classes.join ','
        if klass != node.klass
          removeClasses node.classes, node
          addClasses    classes,      node
          node.klass   = klass
          node.classes = classes.slice()

    addID = (id, node) =>
      if @ids[id]
        throw "Duplicate id `#{id}`"

      @ids[id] = [node] if id
      node.id = id

    removeID = (id, node) =>
      if id?
        delete @ids[id]
      delete node.id

    addClasses = (classes, node) =>
      if classes?
        for k in classes
          list = @classes[k] ? []
          list.push node
          @classes[k] = list

    removeClasses = (classes, node) =>
      if classes?
        for k in classes
          list = @classes[k]
          index = list.indexOf node
          list.splice index, 1 if index >= 0
          if list.length == 0
            delete @classes[k]

    # Track nodes and types
    addNode = (node) =>
      @nodes.push node

    removeNode = (node) =>
      @nodes.splice @nodes.indexOf(node), 1

    # Track nodes by type
    addType = (node) =>
      type = node.type
      list = @types[type] ? []
      list.push node
      @types[type] = list

    removeType = (node) =>
      type = node.type
      list = @types[type] ? []
      index = list.indexOf node
      list.splice index, 1 if index >= 0
      if list.length == 0
        delete @types[type]


  # Querying via CSS selectors

  # Filter array by selector
  filter: (nodes, selector) ->
    matcher = @_matcher selector
    node for node in nodes when matcher node

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

  # Query model by (scoped) selector
  select: (selector, parents) ->
    matches = @_select selector
    matches = @ancestry unique, parents if parents?
    return matches

  # Watch selector with handler
  watch: (selector, handler) ->
    handler.unwatch = () => @unwatch handler
    handler.matcher = @_matcher selector
    @watchers.push handler

  # Unwatch a handler
  unwatch: (handler) ->
    return unless handler.watcher?

    @watchers.splice @watchers.indexOf(handler), 1
    delete handler.unwatch
    delete handler.matcher

  # Check for simplified selector
  _simplify: (s) ->
    # Trim whitespace
    s = s.replace /^\s+/, ''
    s = s.replace /\s+$/, ''

    # Look for *, #id, .class, type
    found = all   = s == ALL
    found = id    = s.match(ID)?[1]    if !found
    found = klass = s.match(CLASS)?[1] if !found
    found = type  = s.match(TYPE)?[0]  if !found
    [all, id, klass, type]

  # Make a matcher for a single selector
  _matcher: (s) ->
    # Check for simple *, #id, .class or type selector
    [all, id, klass, type] = @_simplify s
    return ((node) -> true)                  if all
    return ((node) -> node.id == id)         if id
    return ((node) -> klass in node.classes) if klass
    return ((node) -> node.type == type)     if type

    # Otherwise apply CSS filter
    return @language s

  # Query single selector
  _select: (s) ->

    # Check for simple *, #id, .class or type selector
    [all, id, klass, type] = @_simplify s
    return @nodes                if all
    return @ids[id]        || [] if id
    return @classes[klass] || [] if klass
    return @types[type]    || [] if type

    # Otherwise iterate over everything
    @filter @nodes, s

  getRoot: () ->
    @root

THREE.Binder.apply Model::

module.exports = Model