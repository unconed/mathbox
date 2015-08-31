Parent = require '../base/parent'
Util   = require '../../../util'

class Present extends Parent
  @traits = ['node', 'present']

  init: () ->

  make: () ->
    @nodes  = []
    @steps  = []
    @length = 0
    @last   = []
    @index  = 0
    @dirty  = []

    @_listen 'root', 'root.update', @update
    @_compute 'present.length', () => @length

  adopt: (controller) ->
    node = controller.node
    @nodes.push node if @nodes.indexOf(controller) < 0
    @dirty.push controller

  unadopt: (controller) ->
    node = controller.node
    @nodes = @nodes.filter (x) -> x != controller
    @dirty.push controller

  update: () ->
    return unless @dirty.length

    @slideReset controller for controller in @dirty

    [@steps, @indices] = @process @nodes

    @length = @steps.length
    @index  = null
    @go @props.index

    @dirty = []

  slideLatch:   (controller, enabled, step) -> controller.slideLatch enabled, step
  slideStep:    (controller, index, step) ->   controller.slideStep  @mapIndex(controller, index), step
  slideRelease: (controller, step) ->          controller.slideRelease()
  slideReset:   (controller) ->                controller.slideReset()

  mapIndex: (controller, index) -> index - @indices[controller.node._id]

  process: (nodes) ->

    # Grab nodes' path of slide parents
    slides   = (nodes) -> parents(el).filter isSlide for el in nodes
    traverse = (map) -> (el) -> ref while el and ([el, ref] = [map(el), el])
    parents  = traverse (el) -> if el.parent.traits.hash.present then null else el.parent

    # Helpers
    isSlide = (el) -> nodes.indexOf(el) >= 0
    isSibling = (a, b) ->
      # Different tree level
      c = a.length
      d = b.length
      e = c - d
      return false if e != 0

      # Compare from outside in
      e = Math.min c, d
      for i in [e-1...0] # exclusive end
        return false if a[i] != b[i]

      return true

    # Order paths (leaf -> parent slide -> ...)
    order = (paths) -> paths.sort (a, b) ->
      # Path lengths
      c = a.length
      d = b.length

      # Compare from outside in
      e = Math.min c, d
      for i in [1..e] # inclusive end
        nodeA = a[c - i]
        nodeB = b[d - i]

        # Explicit sibling order (natural)
        f = nodeA.props.order
        g = nodeB.props.order
        if f? or g?
          return e     if f? and g? and ((e = f - g) != 0)
          return -1    if f?
          return 1     if g?

        # Document sibling order (inverted)
        return nodeB.order - nodeA.order if nodeB.order != nodeA.order

      # Different tree level
      e = c - d
      return e if e != 0

      # Equal
      return 0

    split = (steps) ->
      relative = []
      absolute = []
      (if (node = step[0]).props.steps? then relative else absolute).push step for step in steps
      [relative, absolute]

    expand = (lists) ->
      [relative, absolute] = lists

      limit = 100

      indices = {}
      steps   = []
      slide = (step, index) ->
        {props} = node = step[0]
        parent         = step[1]

        parentIndex = if parent? then indices[parent._id] else 0
        #throw "parent index missing" if !parentIndex?
        childIndex  = index

        from = if props.from? then parentIndex + props.from else childIndex - props.early
        to   = if props.to?   then parentIndex + props.to   else childIndex + props.steps + props.late

        from = Math.max 0, from
        to   = Math.min limit, to

        indices[node._id] ?= from
        steps[i] = (steps[i] ?= []).concat step for i in [from...to]

        props.steps

      i = 0
      i += slide step, i for step in relative
      slide      step, 0 for step in absolute

      # Dedupe and order
      steps = (finalize dedupe step for step in steps)

      [steps, indices]

    # Remove duplicates
    dedupe = (step) ->
      if step
        node for node, i in step when step.indexOf(node) == i
      else
        []

    # Finalize individual step by document order
    finalize = (step) -> step.sort (a, b) -> a.order - b.order

    paths = slides nodes
    steps = order  paths
    expand split steps

  go: (index) ->
    # Pad with an empty slide before and after for initial enter/final exit
    index = Math.max 0, Math.min @length + 1, +index || 0

    last    = @last
    active  = @steps[index - 1] ? []
    step    = if @props.directed then index - @index else 1
    @index  = index

    enter = (node for node in active when @last .indexOf(node) < 0)
    exit  = (node for node in @last  when active.indexOf(node) < 0)
    stay  = (node for node in active when enter .indexOf(node) < 0 and
                                          exit  .indexOf(node) < 0)

    ascend   = (nodes) -> nodes.sort (a, b) ->  a.order - b.order
    descend  = (nodes) -> nodes.sort (a, b) ->  b.order - a.order

    toStr = (x) -> x.toString()
    #console.log '============================================================'
    #console.log 'go',  index, {enter: enter.map(toStr), stay: stay.map(toStr), exit: exit.map(toStr)}

    @slideLatch   node.controller, true,  step for node in ascend enter
    @slideLatch   node.controller, null,  step for node in ascend stay
    @slideLatch   node.controller, false, step for node in ascend exit

    @slideStep    node.controller, index, step for node in enter
    @slideStep    node.controller, index, step for node in stay
    @slideStep    node.controller, index, step for node in exit

    @slideRelease node.controller              for node in descend enter
    @slideRelease node.controller              for node in descend stay
    @slideRelease node.controller              for node in descend exit

    @last = active
    return

  change: (changed, touched, init) ->
    if changed['present.index'] or
       init

      @go @props.index


module.exports = Present