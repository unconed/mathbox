Parent = require '../base/parent'

clone  = (x) -> x && JSON.parse(JSON.stringify(x))
deepEq = (a, b) -> JSON.stringify(a) == JSON.stringify(b)

class Latch extends Parent
  @traits = ['node', 'entity', 'active', 'latch']

  init: () ->
    @data = undefined
    @isDirty = true

  make: () ->
    @_helpers.active.make()

    @_listen 'root', 'root.update', () =>
      @update() if @isActive

  unmake: () ->
    @_helpers.active.unmake()
    @data = undefined

  swap: () ->
    {deep, data} = @props
    dirty = if deep then !deepEq(data, @data) else data != @data
    @data = (if deep then clone data else data) if dirty
    dirty

  update: () ->
    @isDirty = @swap()

module.exports = Latch