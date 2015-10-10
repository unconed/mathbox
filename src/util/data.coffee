exports.getSizes = getSizes = (data) ->
  sizes = []
  array = data
  while typeof array != 'string' and array?.length?
    sizes.push array.length
    array = array[0]
  sizes

exports.getDimensions = (data, spec = {}) ->
  {items, channels, width, height, depth} = spec

  dims = {}

  if !data || !data.length
    return {items, channels, width: width ? 0, height: height ? 0, depth: depth ? 0}

  sizes = getSizes data
  nesting = sizes.length

  dims.channels = if channels != 1 and sizes.length > 1 then sizes.pop() else channels
  dims.items    = if items    != 1 and sizes.length > 1 then sizes.pop() else items
  dims.width    = if width    != 1 and sizes.length > 1 then sizes.pop() else width
  dims.height   = if height   != 1 and sizes.length > 1 then sizes.pop() else height
  dims.depth    = if depth    != 1 and sizes.length > 1 then sizes.pop() else depth

  levels    = nesting
  levels++ if channels == 1
  levels++ if items    == 1 and levels > 1
  levels++ if width    == 1 and levels > 2
  levels++ if height   == 1 and levels > 3

  n  = sizes.pop()   ? 1
  n /= dims.channels ? 1 if levels <= 1
  n /= dims.items    ? 1 if levels <= 2
  n /= dims.width    ? 1 if levels <= 3
  n /= dims.height   ? 1 if levels <= 4
  n  = Math.floor n

  if !dims.width?
    dims.width = n
    n = 1
  if !dims.height?
    dims.height = n
    n = 1
  if !dims.depth?
    dims.depth = n
    n = 1

  dims

exports.repeatCall = (call, times) ->
  switch times
    when 0 then () -> true
    when 1 then () ->
      call()
    when 2 then () ->
      call()
      call()
    when 3 then () ->
      call()
      call()
      call()
      call()
    when 4 then () ->
      call()
      call()
      call()
      call()
    when 6 then () ->
      call()
      call()
      call()
      call()
      call()
      call()
    when 8 then () ->
      call()
      call()
      call()
      call()
      call()
      call()

exports.makeEmitter = (thunk, items, channels) ->

  inner = switch channels
    when 0 then () -> true
    when 1 then (emit) -> emit thunk()
    when 2 then (emit) -> emit thunk(), thunk()
    when 3 then (emit) -> emit thunk(), thunk(), thunk()
    when 4 then (emit) -> emit thunk(), thunk(), thunk(), thunk()
    when 6 then (emit) -> emit thunk(), thunk(), thunk(), thunk(), thunk(), thunk()
    when 8 then (emit) -> emit thunk(), thunk(), thunk(), thunk(), thunk(), thunk(), thunk(), thunk()

  next = null
  while items > 0
    n = Math.min items, 8
    outer = switch n
      when 1 then (emit) ->
        inner emit
      when 2 then (emit) ->
        inner emit
        inner emit
      when 3 then (emit) ->
        inner emit
        inner emit
        inner emit
      when 4 then (emit) ->
        inner emit
        inner emit
        inner emit
        inner emit
      when 5 then (emit) ->
        inner emit
        inner emit
        inner emit
        inner emit
        inner emit
      when 6 then (emit) ->
        inner emit
        inner emit
        inner emit
        inner emit
        inner emit
        inner emit
      when 7 then (emit) ->
        inner emit
        inner emit
        inner emit
        inner emit
        inner emit
        inner emit
        inner emit
      when 8 then (emit) ->
        inner emit
        inner emit
        inner emit
        inner emit
        inner emit
        inner emit
        inner emit
        inner emit
    if next?
      next = do (outer, next) -> (emit) -> outer emit; next emit
    else
      next = outer
    items -= n

  outer = next ? () -> true
  outer.reset  = thunk.reset
  outer.rebind = thunk.rebind
  outer


exports.getThunk = (data) ->
  sizes = getSizes data
  nesting = sizes.length

  a = sizes.pop()
  b = sizes.pop()
  c = sizes.pop()
  d = sizes.pop()

  done = false

  switch nesting
    when 0
      thunk = () -> 0
      thunk.reset = () ->

    when 1
      i = 0
      thunk = () -> data[i++]
      thunk.reset = () -> i = 0

    when 2
      i = j = 0
      first = data[j] ? []

      thunk = () ->
        x = first[i++]
        if i == a
          i = 0
          j++
          first = data[j] ? []
        x

      thunk.reset = () ->
        i = j = 0
        first = data[j] ? []
        return

    when 3
      i = j = k = 0
      second = data[k]   ? []
      first  = second[j] ? []

      thunk = () ->
        x = first[i++]
        if i == a
          i = 0
          j++
          if j == b
            j = 0
            k++
            second = data[k] ? []
          first = second[j]  ? []
        x

      thunk.reset = () ->
        i = j = k = 0
        second = data[k]   ? []
        first  = second[j] ? []
        return

    when 4
      i = j = k = l = 0
      third  = data[l]   ? []
      second = third[k]  ? []
      first  = second[j] ? []

      thunk = () ->
        x = first[i++]
        if i == a
          i = 0
          j++
          if j == b
            j = 0
            k++
            if k == c
              k = 0
              l++
              third = data[l] ? []
            second = third[k] ? []
          first = second[j]   ? []
        x

      thunk.reset = () ->
        i = j = k = l = 0
        third  = data[l]   ? []
        second = third[k]  ? []
        first  = second[j] ? []
        return

    when 5
      i = j = k = l = m = 0
      fourth = data[m]   ? []
      third  = fourth[l] ? []
      second = third[k]  ? []
      first  = second[j] ? []

      thunk = () ->
        x = first[i++]
        if i == a
          i = 0
          j++
          if j == b
            j = 0
            k++
            if k == c
              k = 0
              l++
              if l == d
                l = 0
                m++
                fourth = data[m] ? []
              third = fourth[l]  ? []
            second = third[k]    ? []
          first = second[j]      ? []
        x

      thunk.reset = () ->
        i = j = k = l = m = 0
        fourth = data[m]   ? []
        third  = fourth[l] ? []
        second = third[k]  ? []
        first  = second[j] ? []
        return

  thunk.rebind = (d) ->
    data = d

    sizes = getSizes data
    a = sizes.pop() if sizes.length
    b = sizes.pop() if sizes.length
    c = sizes.pop() if sizes.length
    d = sizes.pop() if sizes.length

  thunk

exports.getStreamer = (array, samples, channels, items) ->
  limit = i = j = 0

  reset = ->
    limit = samples * channels * items
    i = j = 0

  count = -> j
  done  = -> limit - i <= 0

  skip = switch channels
    when 1 then (n) ->
      i += n
      j += n
      return

    when 2 then (n) ->
      i += n * 2
      j += n
      return

    when 3 then (n) ->
      i += n * 3
      j += n
      return

    when 4 then (n) ->
      i += n * 4
      j += n
      return

  consume = switch channels
    when 1 then (emit) ->
      emit array[i++]
      ++j
      return

    when 2 then (emit) ->
      emit array[i++], array[i++]
      ++j
      return

    when 3 then (emit) ->
      emit array[i++], array[i++], array[i++]
      ++j
      return

    when 4 then (emit) ->
      emit array[i++], array[i++], array[i++], array[i++]
      ++j
      return

  emit = switch channels
    when 1 then (x) ->
      array[i++] = x
      ++j
      return

    when 2 then (x, y) ->
      array[i++] = x
      array[i++] = y
      ++j
      return

    when 3 then (x, y, z) ->
      array[i++] = x
      array[i++] = y
      array[i++] = z
      ++j
      return

    when 4 then (x, y, z, w) ->
      array[i++] = x
      array[i++] = y
      array[i++] = z
      array[i++] = w
      ++j
      return

  consume.reset = reset
  emit.reset    = reset

  reset()
  {emit, consume, skip, count, done, reset}

exports.getLerpEmitter = (expr1, expr2) ->

  scratch = new Float32Array 4096
  lerp1 = lerp2 = 0.5
  p = q = r = s = 0

  emit1 = (x, y, z, w) ->
    r++
    scratch[p++] = x * lerp1
    scratch[p++] = y * lerp1
    scratch[p++] = z * lerp1
    scratch[p++] = w * lerp1

  emit2 = (x, y, z, w) ->
    s++
    scratch[q++] += x * lerp2
    scratch[q++] += y * lerp2
    scratch[q++] += z * lerp2
    scratch[q++] += w * lerp2

  args = Math.max expr1.length, expr2.length

  if args <= 3
    emitter = (emit, x, i) ->
      p = q = r = s = 0
      expr1 emit1, x, i
      expr2 emit2, x, i
      n = Math.min r, s
      l = 0
      for k in [0...n]
        emit scratch[l++], scratch[l++], scratch[l++], scratch[l++]
  else if args <= 5
    emitter = (emit, x, y, i, j) ->
      p = q = r = s = 0
      expr1 emit1, x, y, i, j
      expr2 emit2, x, y, i, j
      n = Math.min r, s
      l = 0
      for k in [0...n]
        emit scratch[l++], scratch[l++], scratch[l++], scratch[l++]
  else if args <= 7
    emitter = (emit, x, y, z, i, j, k) ->
      p = q = r = s = 0
      expr1 emit1, x, y, z, i, j, k
      expr2 emit2, x, y, z, i, j, k
      n = Math.min r, s
      l = 0
      for k in [0...n]
        emit scratch[l++], scratch[l++], scratch[l++], scratch[l++]
  else if args <= 9
    emitter = (emit, x, y, z, w, i, j, k, l) ->
      p = q = r = s = 0
      expr1 emit1, x, y, z, w, i, j, k, l
      expr2 emit2, x, y, z, w, i, j, k, l
      n = Math.min r, s
      l = 0
      for k in [0...n]
        emit scratch[l++], scratch[l++], scratch[l++], scratch[l++]
  else
    emitter = (emit, x, y, z, w, i, j, k, l, d, t) ->
      p = q = 0
      expr1 emit1, x, y, z, w, i, j, k, l, d, t
      expr2 emit2, x, y, z, w, i, j, k, l, d, t
      n = Math.min r, s
      l = 0
      for k in [0...n]
        emit scratch[l++], scratch[l++], scratch[l++], scratch[l++]

  emitter.lerp = (f) -> [lerp1, lerp2] = [1 - f, f]

  emitter

exports.getLerpThunk = (data1, data2) ->

  # Get sizes
  n1       = exports.getSizes(data1).reduce (a, b) -> a * b
  n2       = exports.getSizes(data2).reduce (a, b) -> a * b
  n        = Math.min n1, n2

  # Create data thunks to copy (multi-)array
  thunk1   = exports.getThunk data1
  thunk2   = exports.getThunk data2

  # Create scratch array
  scratch = new Float32Array n

  scratch.lerp = (f) ->
    thunk1.reset()
    thunk2.reset()

    i = 0
    while i < n
      a = thunk1()
      b = thunk2()
      scratch[i++] = a + (b - a) * f

  scratch

