// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Base } from "./base.js";
import { DoubleSide } from "three/src/constants.js";
import { Mesh } from "three/src/objects/Mesh.js";
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial.js";
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry.js";
export class Debug extends Base {
    constructor(renderer, shaders, options) {
        super(renderer, shaders, options);
        this.geometry = new PlaneGeometry(1, 1);
        this.material = new MeshBasicMaterial({ map: options.map });
        this.material.side = DoubleSide;
        const object = new Mesh(this.geometry, this.material);
        object.position.x += options.x || 0;
        object.position.y += options.y || 0;
        object.frustumCulled = false;
        object.scale.set(2, 2, 2);
        object.__debug = true;
        this.objects = [object];
    }
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        this.objects = this.geometry = this.material = null;
        return super.dispose();
    }
}
