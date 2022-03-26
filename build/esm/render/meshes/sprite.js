// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Base } from "./base.js";
import { DoubleSide } from "three/src/constants.js";
import { Mesh } from "three/src/objects/Mesh.js";
import { SpriteGeometry } from "../geometry/spritegeometry.js";
export class Sprite extends Base {
    constructor(renderer, shaders, options) {
        let f;
        super(renderer, shaders, options);
        let { uniforms } = options;
        const { material, position, sprite, map, combine, linear, color, mask, stpq, } = options;
        if (uniforms == null) {
            uniforms = {};
        }
        const hasStyle = uniforms.styleColor != null;
        this.geometry = new SpriteGeometry({
            items: options.items,
            width: options.width,
            height: options.height,
            depth: options.depth,
        });
        this._adopt(uniforms);
        this._adopt(this.geometry.uniforms);
        // Shared vertex shader
        const factory = shaders.material();
        const v = factory.vertex;
        v.pipe(this._vertexColor(color, mask));
        v.require(this._vertexPosition(position, material, map, 2, stpq));
        v.require(sprite);
        v.pipe("sprite.position", this.uniforms);
        v.pipe("project.position", this.uniforms);
        // Shared fragment shader
        factory.fragment = f = this._fragmentColor(hasStyle, material, color, mask, map, 2, stpq, combine, linear);
        // Split fragment into edge and fill pass for better z layering
        const edgeFactory = shaders.material();
        edgeFactory.vertex.pipe(v);
        edgeFactory.fragment.pipe(f);
        edgeFactory.fragment.pipe("fragment.transparent", this.uniforms);
        const fillFactory = shaders.material();
        fillFactory.vertex.pipe(v);
        fillFactory.fragment.pipe(f);
        fillFactory.fragment.pipe("fragment.solid", this.uniforms);
        const fillOpts = fillFactory.link({
            side: DoubleSide,
        });
        this.fillMaterial = this._material(fillOpts);
        const edgeOpts = edgeFactory.link({
            side: DoubleSide,
        });
        this.edgeMaterial = this._material(edgeOpts);
        this.fillObject = new Mesh(this.geometry, this.fillMaterial);
        this.edgeObject = new Mesh(this.geometry, this.edgeMaterial);
        this._raw(this.fillObject);
        this.fillObject.userData = fillOpts;
        this._raw(this.edgeObject);
        this.edgeObject.userData = edgeOpts;
        this.renders = [this.fillObject, this.edgeObject];
    }
    show(transparent, blending, order, depth) {
        this._show(this.edgeObject, true, blending, order, depth);
        return this._show(this.fillObject, transparent, blending, order, depth);
    }
    dispose() {
        this.geometry.dispose();
        this.edgeMaterial.dispose();
        this.fillMaterial.dispose();
        this.nreders =
            this.geometry =
                this.edgeMaterial =
                    this.fillMaterial =
                        this.edgeObject =
                            this.fillObject =
                                null;
        return super.dispose();
    }
}
