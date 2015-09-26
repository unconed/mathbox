# Threestrap plugin
THREE.Bootstrap.registerPlugin 'splash',
  defaults:
    color: 'mono'
    fancy: true

  listen: ['ready', 'mathbox/init:init', 'mathbox/progress:progress', 'mathbox/destroy:destroy'],

  uninstall: () -> @destroy()

  ready: (event, three) ->
    init event, three if three.MathBox && !@div

  init: (event, three) ->
    @destroy()

    {color} = @options
    html = """
    <div class="mathbox-loader mathbox-splash-#{color}">
      <div class="mathbox-logo">
        <div> <div></div><div></div><div></div> </div>
        <div> <div></div><div></div><div></div> </div>
      </div>
      <div class="mathbox-progress"><div></div></div>
    </div>
    """

    @div = div = document.createElement 'div'
    div.innerHTML = html
    three.element.appendChild div

    x = Math.random()*2-1
    y = Math.random()*2-1
    z = Math.random()*2-1
    l = 1 / Math.sqrt(x * x + y * y + z * z)

    @loader     = div.querySelector('.mathbox-loader')
    @bar        = div.querySelector('.mathbox-progress > div')
    @gyro       = div.querySelectorAll('.mathbox-logo > div')
    @transforms = [
      "rotateZ(22deg) rotateX(24deg) rotateY(30deg)"
      "rotateZ(11deg) rotateX(12deg) rotateY(15deg) scale3d(.6, .6, .6)"
    ]
    @random     = [x * l, y * l, z * l]
    @start      = three.Time.now
    @timer      = null

  # Update splash screen state and animation
  progress: (event, three) ->
    return unless @div

    {current, total} = event

    # Display splash screen
    visible = current < total
    clearTimeout @timer
    if visible
      @loader.classList.remove 'mathbox-exit'
      @loader.style.display = 'block'
    else
      @loader.classList.add 'mathbox-exit'
      @timer = setTimeout (() => @loader.style.display = 'none'), 150

    # Update splash progress
    width = if current < total then (Math.round(1000 * current / total) * .1) + '%' else '100%'
    @bar.style.width = width

    if @options.fancy
      # Spinny gyros
      weights = @random

      # Lerp clock speed
      f = Math.max 0, Math.min 1, three.Time.now - @start
      increment = (transform, j = 0) ->
        transform.replace /(-?[0-9.e]+)deg/g, (_, n) ->
          (+n + weights[j++] * f * three.Time.step * 60) + 'deg'

      for el, i in @gyro
        @transforms[i] = t = increment @transforms[i]
        el.style.transform = el.style.WebkitTransform = t

  destroy: () ->
    @div?.remove()
    @div = null
