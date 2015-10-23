π = Math.PI

ease =

  clamp:  (x, a, b) -> Math.max a, Math.min b, x
  cosine: (x) -> .5 - .5 * Math.cos(ease.clamp(x, 0, 1) * π)
  binary: (x) -> +(x >= .5)
  hold:   (x) -> +(x >= 1)

module.exports = ease