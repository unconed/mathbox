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

exports.makeEmitter = (thunk, items, channels, indices) ->
  inner = switch channels
    when 0 then () -> true
    when 1 then (emit) -> emit thunk()
    when 2 then (emit) -> emit thunk(), thunk()
    when 3 then (emit) -> emit thunk(), thunk(), thunk()
    when 4 then (emit) -> emit thunk(), thunk(), thunk(), thunk()
    when 6 then (emit) -> emit thunk(), thunk(), thunk(), thunk(), thunk(), thunk()
    when 8 then (emit) -> emit thunk(), thunk(), thunk(), thunk(), thunk(), thunk(), thunk(), thunk()

  middle = switch items
    when 0 then () -> true
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
    when 6 then (emit) ->
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

  outer = switch indices
    when 1 then (i, emit) ->                      middle emit
    when 2 then (i, j, emit) ->                   middle emit
    when 3 then (i, j, k, emit) ->                middle emit
    when 4 then (i, j, k, l, emit) ->             middle emit
    when 6 then (i, j, k, l, m, n, emit) ->       middle emit
    when 8 then (i, j, k, l, m, n, o, p, emit) -> middle emit

  outer.reset  = thunk.reset
  outer.rebind = thunk.rebind
  outer

exports.normalizeEmitter = (emitter, indices) ->
  arity = emitter.length - 1
  f = switch indices
    when 1
      switch arity
        when 0 then (i, emit) -> emitter emit
        when 1 then emitter
        else   throw "Invalid expression signature: " + emitter
    when 2
      switch arity
        when 0 then (i, j, emit) -> emitter emit
        when 1 then (i, j, emit) -> emitter i, emit
        when 2 then emitter
        else   throw "Invalid expression signature: " + emitter
    when 3
      switch arity
        when 0 then (i, j, k, emit) -> emitter emit
        when 1 then (i, j, k, emit) -> emitter i, emit
        when 2 then (i, j, k, emit) -> emitter i, j, emit
        when 3 then emitter
        else   throw "Invalid expression signature: " + emitter
    when 4
      switch arity
        when 0 then (i, j, k, l, emit) -> emitter emit
        when 1 then (i, j, k, l, emit) -> emitter i, emit
        when 2 then (i, j, k, l, emit) -> emitter i, j, emit
        when 3 then (i, j, k, l, emit) -> emitter i, j, k, emit
        when 4 then emitter
        else   throw "Invalid expression signature: " + emitter
    when 6
      switch arity
        when 0 then (i, j, k, l, m, n, emit) -> emitter emit
        when 1 then (i, j, k, l, m, n, emit) -> emitter i, emit
        when 2 then (i, j, k, l, m, n, emit) -> emitter i, j, emit
        when 3 then (i, j, k, l, m, n, emit) -> emitter i, j, k, emit
        when 4 then (i, j, k, l, m, n, emit) -> emitter i, j, k, l, emit
        when 5 then (i, j, k, l, m, n, emit) -> emitter i, j, k, l, m, emit
        when 6 then emitter
        else   throw "Invalid expression signature: " + emitter
    when 8
      switch arity
        when 0 then (i, j, k, l, m, n, o, p, emit) -> emitter emit
        when 1 then (i, j, k, l, m, n, o, p, emit) -> emitter i, emit
        when 2 then (i, j, k, l, m, n, o, p, emit) -> emitter i, j, emit
        when 3 then (i, j, k, l, m, n, o, p, emit) -> emitter i, j, k, emit
        when 4 then (i, j, k, l, m, n, o, p, emit) -> emitter i, j, k, l, emit
        when 5 then (i, j, k, l, m, n, o, p, emit) -> emitter i, j, k, l, m, emit
        when 6 then (i, j, k, l, m, n, o, p, emit) -> emitter i, j, k, l, m, n, emit
        when 7 then (i, j, k, l, m, n, o, p, emit) -> emitter i, j, k, l, m, n, o, emit
        when 8 then emitter
        else   throw "Invalid expression signature: " + emitter
    else
      throw "Invalid expression signature: " + emitter

  f.reset  = emitter.reset
  f.rebind = emitter.rebind
  f

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
          [i, j] = [0, j + 1] 
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
          [i, j] = [0, j + 1] 
          if j == b
            [j, k] = [0, k + 1]
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
          [i, j] = [0, j + 1] 
          if j == b
            [j, k] = [0, k + 1]
            if k == c
              [k, l] = [0, l + 1]
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
          [i, j] = [0, j + 1] 
          if j == b
            [j, k] = [0, k + 1]
            if k == c
              [k, l] = [0, l + 1]
              if l == d
                [l, m] = [0, m + 1]
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
