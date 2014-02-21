Acko.Line = function (options) {
  if (options === undefined) return;

  options = options || {};

  this.buffer    = options.buffer     || null;
  this.n         = options.n          || this.buffer.n || 1;
  this.m         = options.m          || this.buffer.m || this.buffer.history || 1;
  this.color     = options.color      || new THREE.Vector4(1, 1, 1, 1);
  this.lineWidth = options.lineWidth  || 1;
  this.lineClip  = options.lineClip   || 1;
  this.zBias     = options.zBias      || 0;
  this.mode      = options.mode       || 'linestrip';
  this.transpose = options.transpose  || false;
  this._uniforms = options.uniforms   || {};

  this.vertexShader   = options.vertexShader   || 'multiline-vertex-data';
  this.fragmentShader = options.fragmentShader || 'multiline-fragment';

  THREE.Object3D.apply(this);

  this.build();
};

Acko.Line.prototype = _.extend(new THREE.Object3D(), {

  attributes: function () {
    return {
      line: {
        type: 'v2',
        value: null,
      },
    };
  },

  set: function (props) {
    for (var i in props) {
      var u = this._uniforms[i];
      if (u) {
        u.value = props[i];
      }
    }
  },

  uniforms: function () {
    return _.extend({}, this._uniforms, this.buffer.uniforms());
  },

  build: function () {
    this._uniforms = _.extend({}, this._uniforms, {
      lineWidth: {
        type: 'f',
        value: this.lineWidth,
      },
      lineClip: {
        type: 'f',
        value: this.lineClip,
      },
      color: {
        type: 'v4',
        value: this.color,
      },
      zBias: {
        type: 'f',
        value: this.zBias,
      },
    });

    var klass = {
      linestrip: Acko.LineStripGeometry,
      lines:     Acko.LinesGeometry,
    }[this.mode];

    var geometry = new klass(this.n, this.m, this.transpose);
    var material = new THREE.ShaderMaterial({
      attributes: this.attributes(),
      uniforms: this.uniforms(),
      vertexShader: getShader(this.vertexShader),
      fragmentShader: getShader(this.fragmentShader),
      side: THREE.DoubleSide,
    });
    material.defaultAttributeValues = null;

    this._geometry = geometry;
    this._material = material;
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.frustumCulled = false;

    this.add(this.mesh);
  },

});
