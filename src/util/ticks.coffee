###
 Generate equally spaced ticks in a range at sensible positions.
 
 @param min/max - Minimum and maximum of range
 @param n - Desired number of ticks in range
 @param unit - Base unit of scale (e.g. 1 or π).
 @param scale - Division scale (e.g. 2 = binary division, or 10 = decimal division).
 @param bias - Integer to bias divisions one or more levels up or down (to create nested scales)
 @param start - Whether to include a tick at the start
 @param end - Whether to include a tick at the end
 @param zero - Whether to include zero as a tick
###

linear = (min, max, n, unit, base, bias, start, end, zero) ->

  # Desired
  n ||= 10
  bias ||= 0

  # Calculate naive tick size.
  span = max - min
  ideal = span / n

  # Round to the floor'd power of 'scale'
  unit ||= 1
  base ||= 10
  ref = unit * (bias + Math.pow(base, Math.floor(Math.log(ideal / unit) / Math.log(base))))

  # Make derived steps at sensible factors.
  factors =
            if base % 2 == 0 then [base / 2, 1, 1 / 2]
            else if base % 3 == 0 then [base / 3, 1, 1 / 3]
            else                       [1]
  steps = (ref * factor for factor in factors)

  # Find step size closest to ideal.
  distance = Infinity
  step = steps.reduce (ref, step) ->
    f = step / ideal
    d = Math.max(f, 1 / f)

    if d < distance
      distance = d
      step
    else
      ref
  , ref

  # Renormalize min/max onto aligned steps.
  min = (Math.ceil (min / step) + +!start) * step
  max = (Math.floor(max / step) - +!end  ) * step
  n = Math.ceil((max - min) / step)

  # Generate equally spaced ticks
  ticks = (min + i * step for i in [0..n])
  ticks = ticks.filter((x) -> x != 0) if !zero
  ticks

###
 Generate logarithmically spaced ticks in a range at sensible positions.
###

log = (min, max, n, unit, base, bias, start, end, zero) ->
  throw "Log ticks not yet implemented."

LINEAR = 0
LOG    = 1

make = (type, min, max, n, unit, base, bias, start, end, zero) ->
  switch type
    when LINEAR then linear min, max, n, unit, base, bias, start, end, zero
    when LOG    then log    min, max, n, unit, base, bias, start, end, zero

exports.make = make
exports.linear = linear
exports.log = log