Resample = require '../operator/resample'
Util     = require '../../../util'

class Retext extends Resample
  @traits = ['node', 'bind', 'operator', 'resample', 'sampler:width', 'sampler:height', 'sampler:depth', 'sampler:items', 'include', 'text']

  init: () ->
    @sourceSpec = [
      { to: 'operator.source', trait: 'text' }
    ]

  textShader: (shader) ->
    @bind.source.textShader shader

  textIsSDF:  () -> @bind.source?.props.sdf > 0
  textHeight: () -> @bind.source?.props.detail

module.exports = Retext
