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
    @_readonly 'present.length', (() => @length)

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

    @steps  = @process @nodes
    @length = @steps.length
    @index  = null
    @go @props.index

    @dirty = []

  slideReset: (controller) ->              controller.slideReset()
  slideEnter: (controller, step) ->        controller.slideEnter step
  slideExit:  (controller, step) ->        controller.slideExit  step
  slideStep:  (controller, index, step) -> controller.slideStep  index, step

  mapIndex: (node, index) -> index - node.controller.slideIndex

  process: (nodes) ->

    # Sort in document order
    nodes.sort (a, b) -> b.order - a.order

    isSlide = (el) -> nodes.indexOf(el) >= 0
    #isBuild = (el) -> el.get 'slide.build'

    slides   = (els) -> parents(el).filter isSlide for el in els
    traverse = (map) -> (el) -> ref while el and ([el, ref] = [map(el), el])
    parents  = traverse (el) -> if el.parent.traits.hash.present then null else el.parent

    ###
    prevs    = traverse (el) -> el.parent?.children[el.index - 1]
    assemble = (els) -> step.concat builds step for step in slides els
    builds   = (els) -> flatten(prevs(el).slice(1).filter isBuild for el in els)
    flatten  = (list, x = []) ->
      x = x.concat y for y in list
      x
    ###

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

    compare = (a, b) ->
      # Different tree level
      c = a.length
      d = b.length
      e = c - d
      return e if e != 0

      # Compare from outside in
      e = Math.min c, d
      for i in [e - 1..0] # inclusive end
        c = a[i]
        d = b[i]

        # Explicit sibling order (natural)
        f = c.props.order
        g = d.props.order
        if f? or g?
          return e     if f? and g? and ((e = f - g) != 0)
          return -1    if f?
          return 1     if g?

        # Document sibling order (inverted)
        return d.order - c.order if d.order != c.order

      # Equal
      return 0

    order = (steps) ->
      steps.sort compare

    tag = (steps) ->
      for step, i in steps
        parent = (step[1]?.controller.slideIndex || 0)
        step[0].controller.slideIndex = i + 1 - parent
      steps

    builds = (steps) ->
      out = steps.slice()

      # Spread non-entering/exiting/sticky slides to adjacent steps
      for step, i in steps
        leaf = step[0]
        {stay, enters, exits} = leaf.props
        before = if enters then 1                else Infinity
        after  = if exits  then Math.max 1, stay else Infinity

        if before
          for j in [i - 1...i - before]
            break if !isSibling steps[j], step
            out[j] = (out[j] ? []).concat step

        if after
          for j in [i + 1...i + after]
            break if !isSibling steps[j], step
            out[j] = (out[j] ? []).concat step

      # Dedupe
      for step, i in out
        out[i] = step.filter (x, j) -> step.indexOf(x) == j

      out

    steps = slides nodes
    steps = order  steps
    steps = tag    steps
    steps = builds steps

    #console.log 'process',  {nodes, steps}

    steps

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

    # Enter in document order (parent -> child), exit in opposite order (child -> parent)
    enter.sort (n) ->  n.order
    stay.sort  (n) ->  n.order
    exit.sort  (n) -> -n.order

    #console.log 'go',  {enter, stay, exit}

    @slideEnter node.controller, step        for node in enter
    @slideStep  node.controller, index, step for node in enter
    @slideStep  node.controller, index, step for node in stay
    @slideStep  node.controller, index, step for node in exit
    @slideExit  node.controller, step        for node in exit

    @last = active
    return

  change: (changed, touched, init) ->
    if changed['present.index'] or
       init

      @go @props.index


module.exports = Present