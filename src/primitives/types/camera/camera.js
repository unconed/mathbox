// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as THREE from "three";
import * as UThree from "../../../util/three";
import { Primitive } from "../../primitive";

export class Camera extends Primitive {
  static initClass() {
    this.traits = ["node", "camera"];
  }

  init() {}

  make() {
    const camera = this._context.defaultCamera;
    this.camera = this.props.proxy ? camera : camera.clone();

    this.euler = new THREE.Euler();
    return (this.quat = new THREE.Quaternion());
  }

  unmake() {}

  getCamera() {
    return this.camera;
  }

  change(changed, touched, init) {
    if (
      changed["camera.position"] ||
      changed["camera.quaternion"] ||
      changed["camera.rotation"] ||
      changed["camera.lookAt"] ||
      changed["camera.up"] ||
      changed["camera.fov"] ||
      init
    ) {
      const { position, quaternion, rotation, lookAt, up, fov } = this.props;

      // Apply transform conservatively to avoid conflicts with controls / proxy
      if (position != null) {
        this.camera.position.copy(position);
      }

      if (quaternion != null || rotation != null || lookAt != null) {
        if (lookAt != null) {
          this.camera.lookAt(lookAt);
        } else {
          this.camera.quaternion.set(0, 0, 0, 1);
        }

        if (rotation != null) {
          this.euler.setFromVector3(
            rotation,
            UThree.swizzleToEulerOrder(this.props.eulerOrder)
          );
          this.quat.setFromEuler(this.euler);
          this.camera.quaternion.multiply(this.quat);
        }

        if (quaternion != null) {
          this.camera.quaternion.multiply(quaternion);
        }
      }

      if (fov != null && this.camera.fov != null) {
        this.camera.fov = fov;
      }

      if (up != null) {
        this.camera.up.copy(up);
      }

      return this.camera.updateMatrix();
    }
  }
}
Camera.initClass();
