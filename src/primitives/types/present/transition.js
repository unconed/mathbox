// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Parent } from "../base/parent.js";

export class Transition extends Parent {
  static initClass() {
    this.traits = [
      "node",
      "transition",
      "transform",
      "mask",
      "visible",
      "active",
    ];
  }

  init() {
    this.animate = null;
    this.uniforms = null;

    this.state = {
      isVisible: true,
      isActive: true,
      enter: 1,
      exit: 1,
    };

    this.latched = null;
    return (this.locked = null);
  }

  make() {
    this.uniforms = {
      transitionFrom: this._attributes.make(this._types.vec4()),
      transitionTo: this._attributes.make(this._types.vec4()),

      transitionActive: this._attributes.make(this._types.bool()),
      transitionScale: this._attributes.make(this._types.vec4()),
      transitionBias: this._attributes.make(this._types.vec4()),
      transitionEnter: this._attributes.make(this._types.number()),
      transitionExit: this._attributes.make(this._types.number()),
      transitionSkew: this._attributes.make(this._types.number()),
    };

    const slideParent = this._inherit("slide");
    const visibleParent = this._inherit("visible");
    const activeParent = this._inherit("active");

    this._listen(slideParent, "transition.latch", (e) => this.latch(e.step));
    this._listen(slideParent, "transition.release", () => this.release());

    this._listen(visibleParent, "visible.change", () => {
      //console.log @node.toString(), 'visible.change ^', visibleParent.isVisible
      return this.update((this.state.isVisible = visibleParent.isVisible));
    });

    this._listen(activeParent, "active.change", () => {
      //console.log @node.toString(), 'active.change ^', activeParent.isActive
      return this.update((this.state.isActive = activeParent.isActive));
    });

    this.animate = this._animator.make(this._types.vec2(1, 1), {
      step: (value) => {
        this.state.enter = value.x;
        this.state.exit = value.y;
        return this.update();
      },
      complete: (done) => this.complete(done),
    });

    return (this.move = this.props.from != null || this.props.to != null);
  }

  //@_helpers.visible.make()
  //@_helpers.active.make()

  unmake() {
    return this.animate.dispose();
  }

  //@_helpers.visible.unmake()
  //@_helpers.active.unmake()

  latch(step) {
    let latched;
    this.locked = null;
    this.latched = latched = {
      isVisible: this.state.isVisible,
      isActive: this.state.isActive,
      step,
    };

    // Reset enter/exit animation if invisible
    const visible = this.isVisible;
    if (!visible) {
      const forward = latched.step >= 0;
      const [enter, exit] = Array.from(forward ? [0, 1] : [1, 0]);
      return this.animate.set(enter, exit);
    }
  }

  //console.log @node.toString(), 'transition::latch', @latched, enter, exit

  release() {
    // Get before/after and unlatch state
    const { latched } = this;
    const { state } = this;
    this.latched = null;

    //console.log @node.toString(), 'transition::release', JSON.parse JSON.stringify {latched, state}

    //p = @; console.log '-> ', p.node.toString(), p.isVisible while p = p._inherit 'visible'

    // Transition if visibility state change
    if (latched.isVisible !== state.isVisible) {
      // Maintain step direction
      const forward = latched.step >= 0;
      const visible = state.isVisible;
      const [enter, exit] = Array.from(
        visible ? [1, 1] : forward ? [1, 0] : [0, 1]
      );

      // Get duration
      let { duration, durationEnter, durationExit } = this.props;
      if (durationEnter == null) {
        durationEnter = duration;
      }
      if (durationExit == null) {
        durationExit = duration;
      }
      duration = visible * durationEnter + !visible * durationExit;

      // Get delay
      let { delay, delayEnter, delayExit } = this.props;
      if (delayEnter == null) {
        delayEnter = delay;
      }
      if (delayExit == null) {
        delayExit = delay;
      }
      delay = visible * delayEnter + !visible * delayExit;

      // Animate enter/exit
      //console.log @node.toString(), '@animate.immediate', {x: enter, y: exit}, {duration, delay, ease: 'linear'}
      this.animate.immediate(
        { x: enter, y: exit },
        { duration, delay, ease: "linear" }
      );

      // Lock visibility and active open during transition
      this.locked = {
        isVisible: true,
        isActive: latched.isActive || state.isActive,
      };
    }

    return this.update();
  }

  complete(done) {
    if (!done) {
      return;
    }
    this.locked = null;
    return this.update();
  }

  update() {
    if (this.latched != null) {
      return;
    } // latched

    let { enter, exit } = this.props;

    // Resolve transition state
    if (enter == null) {
      ({ enter } = this.state);
    }
    if (exit == null) {
      ({ exit } = this.state);
    }

    const level = enter * exit;
    let visible = level > 0;
    const partial = level < 1;

    this.uniforms.transitionEnter.value = enter;
    this.uniforms.transitionExit.value = exit;
    this.uniforms.transitionActive.value = partial;

    // Resolve visibility state
    if (visible) {
      visible = !!this.state.isVisible;
    }
    if (this.locked != null) {
      visible = this.locked.isVisible;
    }

    if (this.isVisible !== visible) {
      this.isVisible = visible;
      this.trigger({ type: "visible.change" });
    }

    // Resolve active state
    const active = !!(
      this.state.isActive ||
      (this.locked != null ? this.locked.isActive : undefined)
    );

    if (this.isActive !== active) {
      this.isActive = active;
      return this.trigger({ type: "active.change" });
    }
  }

  //console.log 'transition update', 'enter', enter, 'exit', exit, 'visible', visible, 'active', active

  change(changed, touched, init) {
    if (changed["transition.enter"] || changed["transition.exit"] || init) {
      this.update();
    }

    if (changed["transition.stagger"] || init) {
      const { stagger } = this.props;

      // Precompute shader constants

      const flipX = stagger.x < 0;
      const flipY = stagger.y < 0;
      const flipZ = stagger.z < 0;
      const flipW = stagger.w < 0;

      const staggerX = Math.abs(stagger.x);
      const staggerY = Math.abs(stagger.y);
      const staggerZ = Math.abs(stagger.z);
      const staggerW = Math.abs(stagger.w);

      this.uniforms.transitionSkew.value =
        staggerX + staggerY + staggerZ + staggerW;

      this.uniforms.transitionScale.value.set(
        (1 - flipX * 2) * staggerX,
        (1 - flipY * 2) * staggerY,
        (1 - flipZ * 2) * staggerZ,
        (1 - flipW * 2) * staggerW
      );

      return this.uniforms.transitionBias.value.set(
        flipX * staggerX,
        flipY * staggerY,
        flipZ * staggerZ,
        flipW * staggerW
      );
    }
  }
}
Transition.initClass();
