// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Track } from "./track.js";
export class Play extends Track {
    static initClass() {
        this.traits = ["node", "track", "trigger", "play", "bind"];
    }
    init() {
        super.init();
        this.skew = null;
        return (this.start = null);
    }
    reset(go) {
        if (go == null) {
            go = true;
        }
        this.skew = go ? 0 : null;
        return (this.start = null);
    }
    make() {
        super.make();
        // Start on slide, or immediately if not inside slide
        this._listen("slide", "slide.step", (e) => {
            const { trigger } = this.props;
            if (trigger != null && e.index === trigger) {
                return this.reset();
            }
            if (trigger != null && e.index === 0) {
                return this.reset(false);
            }
        });
        if (!this.props.trigger || this._inherit("slide") == null) {
            this.reset();
        }
        // Find parent clock
        const parentClock = this._inherit("clock");
        // Update clock
        return this._listen(parentClock, "clock.tick", () => {
            const { from, to, speed, pace, delay, realtime } = this.props;
            const time = parentClock.getTime();
            if (this.skew != null) {
                const now = realtime ? time.time : time.clock;
                const delta = realtime ? time.delta : time.step;
                const ratio = speed / pace;
                if (this.start == null) {
                    this.start = now;
                }
                this.skew += delta * (ratio - 1);
                let offset = Math.max(0, now - this.start + this.skew - delay * ratio);
                if (this.props.loop) {
                    offset = offset % (to - from);
                }
                this.playhead = Math.min(to, from + offset);
            }
            else {
                this.playhead = 0;
            }
            return this.update();
        });
    }
    update() {
        return super.update();
    }
    change(changed, touched, init) {
        if (changed["trigger.trigger"] || changed["play.realtime"]) {
            return this.rebuild();
        }
        return super.change(changed, touched, init);
    }
}
Play.initClass();
