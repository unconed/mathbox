π = Math.PI

ease =

  clamp:  (x, a, b) -> Math.max a, Math.min b, x
  cosine: (x) -> .5 - .5 * Math.cos(ease.clamp(x, 0, 1) * π)

module.exports = ease