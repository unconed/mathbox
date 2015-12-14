Resample = require '../operator/resample'
Util     = require '../../../util'

class Retext extends Resample
  @traits = ['node', 'bind', 'operator', 'resample', 'sampler:x', 'sampler:y', 'sampler:z', 'sampler:w', 'include', 'text']

  init: () ->
    @sourceSpec = [
      { to: 'operator.source', trait: 'text' }
    ]

  textShader: (shader) ->
    @bind.source.textShader shader

  textIsSDF:  () -> @bind.source?.props.sdf > 0
  textHeight: () -> @bind.source?.props.detail

module.exports = Retext
