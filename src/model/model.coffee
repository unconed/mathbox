cssauron = require 'cssauron'

ALL   = '*'
ID     = /^#([A-Za-z0-9_])$/
CLASS  = /^\.([A-Za-z0-9_]+)$/
TRAIT  = /^\[([A-Za-z0-9_]+)\]$/
TYPE   = /^[A-Za-z0-9_]+$/

###

  Model that wraps a root node and its children.
  
  Monitors adds, removals and ID/class changes.
  Enables CSS selectors, both querying and watching.

  Watchers are primed differentially as changes come in,
  and fired with digest().

###
class Model
  constructor: (@root) ->
    @root.model = @
    @root.root  = @root

    @ids      = {}
    @classes  = {}
    @traits   = {}
    @types    = {}
    @nodes    = []
    @watchers = []
    @fire     = false

    @event = type: 'update'

    # Prepare CSSauron
    @language =
      cssauron
        tag:      'type'
        id:       'id'
        class:    "classes.join(' ')"
        parent:   'parent'
        children: 'children'
        attr:     'traits.hash[attr]'

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
      force node

    dispose = (node) =>
      removeNode node
      removeType node
      removeID      node.id
      removeClasses node.classes
      node.off 'change:node', update
      force node

    # Watcher cycle
    prime = (node) =>
      for watcher in @watchers.slice()
        watcher.match = watcher.matcher node
      null

    check = (node) =>
      for watcher in @watchers.slice()
        @fire ||= watcher.fire ||= (watcher.match != watcher.matcher node)
      null

    force = (node) =>
      for watcher in @watchers.slice()
        @fire ||= watcher.fire ||= watcher.matcher node
      null

    @digest = () =>
      return unless @fire
      for watcher in @watchers.slice() when watcher.fire
        watcher.fire = false
        watcher.handler()
      @fire = false
      null

    # Track id/class changes
    update = (event, node, init) =>
      _id    = init or event.changed['node.id']
      _klass = init or event.changed['node.classes']
      primed = false

      if _id
        id = node.get 'node.id'
        if id != node.id
          prime node unless init
          primed = true

          removeID node.id, node
          addID    id,      node

      if _klass
        classes = node.get 'node.classes'
        klass   = classes.join ','
        if klass != node.classes?.klass
          prime node unless init or primed
          primed = true

          removeClasses node.classes, node
          addClasses    classes,      node

          node.classes       = classes.slice()
          node.classes.klass = klass
          hash = node.classes.hash = {}
          hash[klass] = true for klass in node.classes

      check node if !init and primed
      null

    # Manage lookup tables for types/classes/traits
    addTags = (sets, tags, node) =>
      return unless tags?
      for k in tags
        list = sets[k] ? []
        list.push node
        sets[k] = list
      null

    removeTags = (sets, tags, node) =>
      return unless tags?
      for k in tags
        list = sets[k]
        index = list.indexOf node
        list.splice index, 1 if index >= 0
        if list.length == 0
          delete sets[k]
      null

    # Track IDs (live)
    addID = (id, node) =>
      if @ids[id]
        throw "Duplicate id `#{id}`"

      @ids[id] = [node] if id
      node.id = id

    removeID = (id, node) =>
      if id?
        delete @ids[id]
      delete node.id

    # Track classes (live)
    addClasses    = (classes, node) => addTags    @classes, classes, node
    removeClasses = (classes, node) => removeTags @classes, classes, node

    # Track nodes
    addNode       = (node) => @nodes.push node
    removeNode    = (node) => @nodes.splice @nodes.indexOf(node), 1

    # Track nodes by type
    addType       = (node) => addTags    @types, [node.type], node
    removeType    = (node) => removeTags @types, [node.type], node

    # Track nodes by trait
    addTraits     = (node) => addTags    @traits, node.traits, node
    removeTraits  = (node) => removeTags @traits, node.traits, node

    adopt @root

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
    handler.watcher = watcher = {
      handler: handler
      matcher: @_matcher selector
      match:   false
      fire:    false
    }
    @watchers.push watcher
    @select selector

  # Unwatch a handler
  unwatch: (handler) ->
    watcher = handler.watcher
    return unless watcher?

    @watchers.splice @watchers.indexOf(watcher), 1
    delete handler.unwatch
    delete handler.watcher

  # Check for simplified selector
  _simplify: (s) ->
    # Trim whitespace
    s = s.replace /^\s+/, ''
    s = s.replace /\s+$/, ''

    # Look for *, #id, .class, type
    found = all   = s == ALL
    found = id    = s.match(ID)?[1]    if !found
    found = klass = s.match(CLASS)?[1] if !found
    found = trait = s.match(TRAIT)?[1] if !found
    found = type  = s.match(TYPE)?[0]  if !found
    [all, id, klass, trait, type]

  # Make a matcher for a single selector
  _matcher: (s) ->
    # Check for simple *, #id, .class or type selector
    [all, id, klass, trait, type] = @_simplify s
    return ((node) -> true)                     if all
    return ((node) -> node.id == id)            if id
    return ((node) -> node.classes.hash[klass]) if klass
    return ((node) -> node.traits.hash[trait])  if trait
    return ((node) -> node.type == type)        if type

    # Otherwise apply CSS filter
    return @language s

  # Query single selector
  _select: (s) ->

    # Check for simple *, #id, .class or type selector
    [all, id, klass, trait, type] = @_simplify s
    return @nodes                if all
    return @ids[id]        || [] if id
    return @classes[klass] || [] if klass
    return @traits[trait]  || [] if trait
    return @types[type]    || [] if type

    # Otherwise iterate over everything
    @filter @nodes, s

  getRoot: () ->
    @root

THREE.Binder.apply Model::

module.exports = Model