(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.MathBox.Shaders = {"axis.position": "uniform vec4 axisStep;\nuniform vec4 axisPosition;\n\nvec4 getAxisPosition(vec2 uv) {\n  return axisStep * uv.x + axisPosition;\n}\n",
"cartesian.position": "uniform mat4 cartesianMatrix;\n\nvec4 getCartesianPosition(vec4 position) {\n  return cartesianMatrix * vec4(position.xyz, 1.0);\n}\n",
"line.color": "uniform vec3 lineColor;\nuniform float lineOpacity;\n\nvoid getLineColor() {\n\tgl_FragColor = vec4(lineColor, lineOpacity);\n}\n",
"line.position": "uniform float lineWidth;\nattribute vec2 line;\n\n// External\nvec3 getPosition(vec2 xy);\n\nvoid getLineGeometry(vec2 xy, float edge, inout vec3 left, inout vec3 center, inout vec3 right) {\n  vec2 delta = vec2(1.0, 0.0);\n\n  center =                 getPosition(xy);\n  left   = (edge > -0.5) ? getPosition(xy - delta) : center;\n  right  = (edge < 0.5)  ? getPosition(xy + delta) : center;\n}\n\nvec3 getLineJoin(float edge, vec3 left, vec3 center, vec3 right) {\n  vec3 bitangent;\n  vec3 normal = center;\n\n  vec3 legLeft = center - left;\n  vec3 legRight = right - center;\n\n  if (edge > 0.5) {\n    bitangent = normalize(cross(normal, legLeft));\n  }\n  else if (edge < -0.5) {\n    bitangent = normalize(cross(normal, legRight));\n  }\n  else {\n    vec3 joinLeft = normalize(cross(normal, legLeft));\n    vec3 joinRight = normalize(cross(normal, legRight));\n    float dotLR = dot(joinLeft, joinRight);\n    float scale = min(8.0, tan(acos(dotLR * .999) * .5) * .5);\n    bitangent = normalize(joinLeft + joinRight) * sqrt(1.0 + scale * scale);\n  }\n  \n  return bitangent;\n}\n\nvec3 getLinePosition() {\n  vec3 left, center, right, join;\n\n  float edge = line.x;\n  float offset = line.y;\n\n  getLineGeometry(position.xy, edge, left, center, right);\n  join = getLineJoin(edge, left, center, right);\n  return center + join * offset * lineWidth;\n}\n",
"project.position": "void setPosition(vec3 position) {\n\tgl_Position   = projectionMatrix * vec4(position, 1.0);\n}\n",
"view.position": "vec3 getViewPosition(vec4 position) {\n  return (modelViewMatrix * vec4(position.xyz, 1.0)).xyz;\n}"};

},{}],2:[function(require,module,exports){
var Context, Model, Primitives, Render, Shaders, Stage;

Model = require('./model');

Stage = require('./stage');

Render = require('./render');

Shaders = require('./shaders');

Primitives = require('./primitives');

Context = (function() {
  function Context(gl, scene, camera, script) {
    if (script == null) {
      script = [];
    }
    this.shaders = new Shaders.Factory(Shaders.Snippets);
    this.scene = new Render.Scene(scene);
    this.renderables = new Render.Factory(gl, Render.Classes, this.shaders);
    this.attributes = new Model.Attributes(Primitives.Traits, Primitives.Types);
    this.primitives = new Primitives.Factory(Primitives.Classes, this.attributes, this.renderables, this.shaders);
    this.model = new Model.Model(this.primitives.make('root'));
    this.controller = new Stage.Controller(this.model, this.scene, this.primitives);
    this.animator = new Stage.Animator(this.model);
    this.director = new Stage.Director(this.controller, this.animator, script);
    this.api = new Stage.API(this.controller, this.animator, this.director);
  }

  Context.prototype.init = function() {
    return this.scene.inject();
  };

  Context.prototype.destroy = function() {
    return this.scene.unject();
  };

  Context.prototype.update = function() {
    this.animator.update();
    return this.attributes.digest();
  };

  return Context;

})();

module.exports = Context;


},{"./model":6,"./primitives":10,"./render":30,"./shaders":37,"./stage":42}],3:[function(require,module,exports){
var Context, mathBox;

mathBox = function(options) {
  var three;
  if (options == null) {
    options = {};
  }
  if (options.plugins == null) {
    options.plugins = ['core', 'mathbox'];
  }
  three = THREE.Bootstrap(options);
  return three.mathbox;
};

window.MathBox = exports;

window.mathBox = exports.mathBox = mathBox;

exports.version = '2';

require('../build/shaders');


/*
 */

Context = require('./context');

THREE.Bootstrap.registerPlugin('mathbox', {
  defaults: {
    init: true
  },
  listen: ['ready', 'update'],
  install: function(three) {
    var inited;
    inited = false;
    return three.MathBox = {
      init: (function(_this) {
        return function(options) {
          var camera, scene, script;
          if (inited) {
            return;
          }
          inited = true;
          scene = (options != null ? options.scene : void 0) || _this.options.scene || three.scene;
          camera = (options != null ? options.camera : void 0) || _this.options.camera || three.camera;
          script = (options != null ? options.script : void 0) || _this.options.script;
          _this.context = new Context(three.renderer.context, scene, camera, script);
          _this.context.api.three = three;
          three.mathbox = _this.context.api;
          _this.context.init();
          window.model = _this.context.model;
          return window.root = _this.context.model.root;
        };
      })(this),
      destroy: (function(_this) {
        return function() {
          if (!inited) {
            return;
          }
          inited = false;
          _this.context.destroy();
          delete three.mathbox;
          delete _this.context.api.three;
          return delete _this.context;
        };
      })(this),
      object: function() {
        var _ref;
        return (_ref = this.context) != null ? _ref.scene.getRoot() : void 0;
      }
    };
  },
  uninstall: function(three) {
    three.MathBox.destroy();
    return delete three.MathBox;
  },
  ready: function(event, three) {
    if (this.options.init) {
      return three.MathBox.init();
    }
  },
  update: function(event, three) {
    var _ref;
    return (_ref = this.context) != null ? _ref.update() : void 0;
  }
});


/*
 */


},{"../build/shaders":1,"./context":2}],4:[function(require,module,exports){

/*
 Custom attribute model
 - Stores attributes in three.js uniform-style objects so they can be passed around by reference into renderables
 - Avoids copying value objects on set
 - Coalesces update notifications per object
 */
var Attributes, Data;

Attributes = (function() {
  function Attributes(traits, types) {
    this.traits = traits;
    this.types = types;
    this.pending = [];
  }

  Attributes.prototype.make = function(type) {
    return {
      type: typeof type.uniform === "function" ? type.uniform() : void 0,
      value: type.make()
    };
  };

  Attributes.prototype.getSpec = function(name) {
    return this.traits[name];
  };

  Attributes.prototype.queue = function(callback) {
    return this.pending.push(callback);
  };

  Attributes.prototype.apply = function(object, traits) {
    if (traits == null) {
      traits = [];
    }
    return new Data(object, traits, this);
  };

  Attributes.prototype.digest = function() {
    var callback, calls, limit, _i, _len, _ref;
    limit = 10;
    while (this.pending.length > 0 && --limit > 0) {
      _ref = [this.pending, []], calls = _ref[0], this.pending = _ref[1];
      for (_i = 0, _len = calls.length; _i < _len; _i++) {
        callback = calls[_i];
        callback();
      }
    }
    if (limit === 0) {
      console.error('While digesting: ', object);
      throw Error("Infinite loop in Data::digest");
    }
  };

  return Attributes;

})();

Data = (function() {
  function Data(object, traits, attributes) {
    var change, changes, digest, dirty, event, get, key, makers, name, options, set, spec, trait, validate, validators, values, _i, _len, _ref;
    if (traits == null) {
      traits = [];
    }
    get = (function(_this) {
      return function(key) {
        var _ref;
        return (_ref = _this[key]) != null ? _ref.value : void 0;
      };
    })(this);
    set = (function(_this) {
      return function(key, value, ignore) {
        var replace;
        replace = validate(key, value, _this[key].value);
        if (replace != null) {
          _this[key].value = replace;
        }
        if (!ignore) {
          return change(key);
        }
      };
    })(this);
    object.get = (function(_this) {
      return function(key) {
        var out, value;
        if (key != null) {
          return get(key);
        } else {
          out = {};
          for (key in _this) {
            value = _this[key];
            out[key] = value.value;
          }
          return out;
        }
      };
    })(this);
    object.set = function(key, value, ignore) {
      var options;
      if ((key != null) && (value != null)) {
        if (validators[key] != null) {
          set(key, value, ignore);
        }
      } else {
        options = key;
        for (key in options) {
          value = options[key];
          if (validators[key] != null) {
            set(key, value, ignore);
          }
        }
      }
    };
    makers = {};
    validators = {};
    validate = function(key, value, target) {
      return validators[key](value, target);
    };
    object.validate = function(key, value) {
      var make, replace, target;
      make = makers[key];
      if (make != null) {
        target = make();
      }
      replace = validate(key, value, target);
      if (replace != null) {
        return replace;
      } else {
        return target;
      }
    };
    dirty = false;
    changes = {};
    change = (function(_this) {
      return function(key) {
        if (!dirty) {
          dirty = true;
          attributes.queue(digest);
        }
        return changes[key] = _this[key].value;
      };
    })(this);
    event = {
      type: 'change',
      changed: null
    };
    digest = function() {
      event.changed = changes;
      changes = {};
      dirty = false;
      return object.trigger(event);
    };
    values = {};
    for (_i = 0, _len = traits.length; _i < _len; _i++) {
      trait = traits[_i];
      _ref = trait.split(':'), trait = _ref[0], name = _ref[1];
      if (name == null) {
        name = trait;
      }
      spec = attributes.getSpec(trait);
      for (key in spec) {
        options = spec[key];
        key = [name, key].join('.');
        this[key] = {
          type: typeof options.uniform === "function" ? options.uniform() : void 0,
          value: options.make()
        };
        makers[key] = options.make;
        validators[key] = options.validate;
      }
    }
  }

  return Data;

})();

module.exports = Attributes;


},{}],5:[function(require,module,exports){
var Group, Node,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Node = require('./node');

Group = (function(_super) {
  __extends(Group, _super);

  function Group(options, type, traits, attributes) {
    Group.__super__.constructor.call(this, options, type, traits, attributes);
    this.children = [];
  }

  Group.prototype.add = function(node) {
    this.children.push(node);
    return node._added(this);
  };

  Group.prototype.remove = function(node) {
    var child;
    this.children = (function() {
      var _i, _len, _ref, _results;
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child !== node) {
          _results.push(child);
        }
      }
      return _results;
    }).call(this);
    return node._removed(this);
  };

  return Group;

})(Node);

module.exports = Group;


},{"./node":8}],6:[function(require,module,exports){
exports.Attributes = require('./attributes');

exports.Group = require('./group');

exports.Model = require('./model');

exports.Node = require('./node');


},{"./attributes":4,"./group":5,"./model":7,"./node":8}],7:[function(require,module,exports){
var Model;

Model = (function() {
  function Model(root) {
    this.root = root;
    this.root.model = this;
    this.root.root = this.root;
  }

  Model.prototype.getRoot = function() {
    return this.root;
  };

  return Model;

})();

THREE.Binder.apply(Model.prototype);

module.exports = Model;


},{}],8:[function(require,module,exports){
var Node;

Node = (function() {
  function Node(options, type, traits, attributes) {
    this.type = type;
    this.traits = traits != null ? traits : [];
    this.attributes = attributes.apply(this, this.traits);
    this.parent = null;
    this.root = null;
    this.set(options, null, true);
  }

  Node.prototype._added = function(parent) {
    var event;
    this.parent = parent;
    this.root = parent.root;
    event = {
      type: 'added',
      object: this,
      parent: this.parent
    };
    this.trigger(event);
    if (this.root !== this) {
      return this.root.model.trigger(event);
    }
  };

  Node.prototype._removed = function() {
    var event;
    this.root = this.parent = null;
    event = {
      type: 'removed',
      object: this
    };
    this.trigger(event);
    if (this.root !== this) {
      return this.root.model.trigger(event);
    }
  };

  return Node;

})();

THREE.Binder.apply(Node.prototype);

module.exports = Node;


},{}],9:[function(require,module,exports){
var Factory;

Factory = (function() {
  function Factory(classes, attributes, renderables, shaders) {
    this.classes = classes;
    this.attributes = attributes;
    this.renderables = renderables;
    this.shaders = shaders;
  }

  Factory.prototype.getTypes = function() {
    return Object.keys(this.classes);
  };

  Factory.prototype.make = function(type, options) {
    var controller, klass, model, modelKlass;
    klass = this.classes[type];
    modelKlass = klass.model;
    model = new modelKlass(options, type, klass.traits, this.attributes);
    controller = new klass(model, this.attributes, this.renderables, this.shaders);
    return model;
  };

  return Factory;

})();

module.exports = Factory;


},{}],10:[function(require,module,exports){
var Types;

Types = require('./types');

exports.Factory = require('./factory');

exports.Primitive = require('./primitive');

exports.Types = Types.Types;

exports.Traits = Types.Traits;

exports.Classes = Types.Classes;


},{"./factory":9,"./primitive":11,"./types":16}],11:[function(require,module,exports){
var Model, Primitive;

Model = require('../model');

Primitive = (function() {
  Primitive.Node = Model.Node;

  Primitive.Group = Model.Group;

  Primitive.model = Primitive.Node;

  Primitive.traits = [];

  function Primitive(model, _attributes, _factory, _shaders) {
    this.model = model;
    this._attributes = _attributes;
    this._factory = _factory;
    this._shaders = _shaders;
    this.model.primitive = this;
    this.model.on('change', (function(_this) {
      return function(event) {
        if (_this.root) {
          return _this._change(event.changed);
        }
      };
    })(this));
    this.model.on('added', (function(_this) {
      return function(event) {
        return _this._added();
      };
    })(this));
    this.model.on('removed', (function(_this) {
      return function(event) {
        return _this._removed();
      };
    })(this));
    this.inherited = [];
  }

  Primitive.prototype.rebuild = function() {
    if (this.root) {
      this._unmake();
      this._make();
      return this._change({}, true);
    }
  };

  Primitive.prototype._make = function() {};

  Primitive.prototype._unmake = function() {};

  Primitive.prototype._added = function() {
    this.root = this.model.root;
    this.parent = this.model.parent.primitive;
    this._make();
    return this._change({}, true);
  };

  Primitive.prototype._removed = function() {
    return this.root = null;
  };

  Primitive.prototype._render = function(renderable) {
    return this.trigger({
      type: 'render',
      renderable: renderable
    });
  };

  Primitive.prototype._unrender = function(renderable) {
    return this.trigger({
      type: 'unrender',
      renderable: renderable
    });
  };

  Primitive.prototype._transform = function(shader) {
    var _ref;
    return (_ref = this.parent) != null ? _ref._transform(shader) : void 0;
  };

  Primitive.prototype._change = function(changed) {};

  Primitive.prototype._listen = function(object, key) {
    var handler, inherited;
    if (object === this) {
      return;
    }
    handler = (function(_this) {
      return function(event) {
        var changed;
        changed = event.changed;
        if (_this.root && (changed[key] != null)) {
          return _this._change(changed);
        }
      };
    })(this);
    object.model.on('change', handler);
    inherited = [object, handler];
    return this.inherited.push(inherited);
  };

  Primitive.prototype._unlisten = function(inherited) {
    var handler, object;
    object = inherited[0], handler = inherited[1];
    return object.model.off('change', handler);
  };

  Primitive.prototype._inherit = function(key, target) {
    if (target == null) {
      target = this;
    }
    if (this.model.get(key) != null) {
      target._listen(this, key);
      return this.model;
    }
    if (this.parent != null) {
      return this.parent._inherit(key, target);
    } else {
      return null;
    }
  };

  Primitive.prototype._unherit = function() {
    var inherited, _i, _len, _ref;
    _ref = this.inherited;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      inherited = _ref[_i];
      this._unlisten(inherited);
    }
    return this.inherited = [];
  };

  return Primitive;

})();

THREE.Binder.apply(Primitive.prototype);

module.exports = Primitive;


},{"../model":6}],12:[function(require,module,exports){
var Axis, Primitive,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../primitive');

Axis = (function(_super) {
  __extends(Axis, _super);

  Axis.traits = ['object', 'style', 'line', 'axis'];

  function Axis(model, attributes, factory, shaders) {
    Axis.__super__.constructor.call(this, model, attributes, factory, shaders);
    this.axisPosition = this.axisStep = this.resolution = this.line = null;
  }

  Axis.prototype._make = function() {
    var detail, lineUniforms, position, positionUniforms, samples, types;
    this.inherit = this._inherit('view.range');
    types = this._attributes.types;
    positionUniforms = {
      axisPosition: this._attributes.make(types.vec4()),
      axisStep: this._attributes.make(types.vec4())
    };
    this.axisPosition = positionUniforms.axisPosition.value;
    this.axisStep = positionUniforms.axisStep.value;
    position = this._shaders.shader();
    position.call('axis.position', positionUniforms);
    this._transform(position);
    detail = this.model.get('axis.detail');
    samples = detail + 1;
    this.resolution = 1 / detail;
    lineUniforms = {
      lineWidth: this.model.attributes['line.width'],
      lineColor: this.model.attributes['style.color'],
      lineOpacity: this.model.attributes['style.opacity']
    };
    this.line = this._factory.make('line', {
      uniforms: lineUniforms,
      samples: samples,
      position: position
    });
    return this._render(this.line);
  };

  Axis.prototype._unmake = function() {
    this._unrender(this.line);
    this.line.dispose();
    this.line = null;
    this.position = null;
    return this._unherit();
  };

  Axis.prototype._change = function(changed, first) {
    var dimension, inherit, max, min, range, ranges, w, x, y, z;
    if (changed['axis.detail'] != null) {
      this.rebuild();
    }
    if ((changed['view.range'] != null) || (changed['axis.range'] != null) || (changed['axis.dimension'] != null) || (changed['axis.inherit'] != null) || first) {
      inherit = this.model.get('axis.inherit');
      dimension = this.model.get('axis.dimension');
      if (inherit && this.inherit) {
        ranges = this.inherit.get('view.range');
        range = ranges[dimension - 1];
      } else {
        range = this.model.get('axis.range');
      }
      min = range.x;
      max = range.y;
      x = dimension === 1 ? 1 : 0;
      y = dimension === 2 ? 1 : 0;
      z = dimension === 3 ? 1 : 0;
      w = dimension === 4 ? 1 : 0;
      this.axisPosition.set(x, y, z, w).multiplyScalar(min);
      return this.axisStep.set(x, y, z, w).multiplyScalar((max - min) * this.resolution);
    }
  };

  return Axis;

})(Primitive);

module.exports = Axis;


},{"../primitive":11}],13:[function(require,module,exports){
var Cartesian, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('./view');

Cartesian = (function(_super) {
  __extends(Cartesian, _super);

  function Cartesian() {
    return Cartesian.__super__.constructor.apply(this, arguments);
  }

  Cartesian.prototype._make = function() {
    var types;
    types = this._attributes.types;
    this.uniforms = {
      cartesianMatrix: this._attributes.make(types.mat4())
    };
    this.cartesianMatrix = this.uniforms.cartesianMatrix.value;
    return this.rotationMatrix = new THREE.Matrix4();
  };

  Cartesian.prototype._unmake = function() {
    delete this.cartesianMatrix;
    return delete this.rotationMatrix;
  };

  Cartesian.prototype._change = function(changed) {
    var dx, dy, dz, o, q, r, s, sx, sy, sz, x, y, z;
    o = this.model.get('object.position');
    s = this.model.get('object.scale');
    q = this.model.get('object.rotation');
    r = this.model.get('view.range');
    x = r[0].x;
    y = r[1].x;
    z = r[2].x;
    dx = (r[0].y - x) || 1;
    dy = (r[1].y - y) || 1;
    dz = (r[2].y - z) || 1;
    sx = s.x;
    sy = s.y;
    sz = s.z;
    this.cartesianMatrix.set(2 * sx / dx, 0, 0, -(2 * x + dx) * sx / dx, 0, 2 * sy / dy, 0, -(2 * y + dy) * sy / dy, 0, 0, 2 * sz / dz, -(2 * z + dz) * sz / dz, 0, 0, 0, 1);
    this.rotationMatrix.makeRotationFromQuaternion(q);
    return this.cartesianMatrix.multiplyMatrices(this.rotationMatrix, this.cartesianMatrix);

    /*
     * Backward transform
    @inverseViewMatrix.set(
      dx/(2*sx), 0, 0, (x+dx/2),
      0, dy/(2*sy), 0, (y+dy/2),
      0, 0, dz/(2*sz), (z+dz/2),
      0, 0, 0, 1 #,
    )
    @q.copy(q).inverse()
    @rotationMatrix.makeRotationFromQuaternion q
    @inverseViewMatrix.multiplyMatrices @inverseViewMatrix, @rotationMatrix
     */
  };

  Cartesian.prototype.to = function(vector) {
    return vector.applyMatrix4(this.cartesianMatrix);
  };

  Cartesian.prototype._transform = function(shader) {
    var _ref;
    shader.call('cartesian.position', this.uniforms);
    return (_ref = this.parent) != null ? _ref._transform(shader) : void 0;
  };


  /*
  from: (vector) ->
    this.inverse.multiplyVector3(vector);
  },
   */

  return Cartesian;

})(View);

module.exports = Cartesian;


},{"./view":20}],14:[function(require,module,exports){
var Grid, Primitive, Ticks, Types,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../primitive');

Ticks = require('../../util').Ticks;

Types = require('./types');

Grid = (function(_super) {
  __extends(Grid, _super);

  Grid.traits = ['line', 'object', 'grid', 'axis:axis[0]', 'axis:axis[1]'];

  function Grid(model, attributes, factory, shaders) {
    Grid.__super__.constructor.call(this, model, attributes, factory, shaders);
    this.widths = [];
    this.lines = null;
    this.buffers = null;
    this.grids = [];
  }

  Grid.prototype._make = function() {
    var axes, axis, uniforms;
    this.inherit = this._inherit('view');
    uniforms = {
      lineWidth: this.attributes['line.width'],
      lineColor: this.attributes['style.color'],
      lineOpacity: this.attributes['style.opacity']
    };
    axis = function(prefix, dimension) {
      var buffer, grid, key, line, ticks, types, value, width;
      types = this._attributes.types;
      grid = {
        gridRange: this._attributes.make(types.vec2(-1, 1)),
        gridAxis: this._attributes.make(types.vec3(0, 2, 0)),
        gridOffset: this._attributes.make(types.vec2(0, -1, 0))
      };
      for (key in uniforms) {
        value = uniforms[key];
        grid[key] = value;
      }
      ticks = this.get(prefix + 'ticks');
      width = ticks * 2;
      buffer = this._factory.make('databuffer', {
        samples: width,
        channels: 1
      });
      line = this._factory.make('line', {
        uniforms: uniforms,
        buffer: buffer
      });
      this.widths.push(width);
      this.buffers.push(buffer);
      this.lines.push(line);
      this.grids.push(grid);
      return this._render(line);
    };
    axes = this.get('grid.axes');
    return axis('axis[0].', axes[0]);
  };

  Grid.prototype._unmake = function() {
    var buffer, line, _i, _j, _len, _len1, _ref, _ref1;
    _ref = this.buffers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      buffer = _ref[_i];
      buffer.dispose();
    }
    _ref1 = this.lines;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      line = _ref1[_j];
      this._unrender(line);
      line.dispose();
    }
    this.widths = [];
    this.lines = null;
    return this.buffers = null;
  };

  Grid.prototype._change = function(changed) {
    var axes, axis;
    if ((changed['axis1.ticks'] != null) || (changed['axis2.ticks'] != null)) {
      return this.rebuild();
    }
    axis = function(prefix, dimension, buffer, grid) {
      var base, inherit, max, min, range, ranges, scale, ticks, unit;
      inherit = this.get(prefix + 'inherit');
      if (inherit && this.inherit) {
        ranges = this.inherit.get('view.range');
        range = ranges[dimension];
      } else {
        range = this.get(prefix + 'range');
      }
      ticks = this.get(prefix + 'ticks');
      unit = this.get(prefix + 'unit');
      base = this.get(prefix + 'base');
      scale = this.get(prefix + 'scale');
      min = range.x;
      max = range.y;
      ticks = Ticks.make(scale, min, max, ticks, unit, base);
      return buffer.copy(ticks);
    };
    axes = this.get('grid.axes');
    return axis('axis[0].', axes[0], this.buffer[0], this.grid[0]);
  };

  return Grid;

})(Primitive);

module.exports = Grid;


},{"../../util":43,"../primitive":11,"./types":19}],15:[function(require,module,exports){
var Group, Primitive,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../primitive');

Group = (function(_super) {
  __extends(Group, _super);

  function Group() {
    return Group.__super__.constructor.apply(this, arguments);
  }

  Group.model = Primitive.Group;

  return Group;

})(Primitive);

module.exports = Group;


},{"../primitive":11}],16:[function(require,module,exports){
var Classes, Group, Model, Node;

Model = require('../../model');

Node = Model.Node;

Group = Model.Group;

Classes = {
  axis: require('./axis'),
  grid: require('./grid'),
  cartesian: require('./cartesian'),
  group: require('./group'),
  root: require('./root'),
  view: require('./view')
};

exports.Classes = Classes;

exports.Types = require('./types');

exports.Traits = require('./traits');


},{"../../model":6,"./axis":12,"./cartesian":13,"./grid":14,"./group":15,"./root":17,"./traits":18,"./types":19,"./view":20}],17:[function(require,module,exports){
var Group, Root,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Group = require('./group');

Root = (function(_super) {
  __extends(Root, _super);

  function Root() {
    return Root.__super__.constructor.apply(this, arguments);
  }

  Root.traits = ['object'];

  Root.prototype._transform = function(shader) {
    return shader.call('view.position');
  };

  return Root;

})(Group);

module.exports = Root;


},{"./group":15}],18:[function(require,module,exports){
var Traits, Types;

Types = require('./types');

Traits = {
  object: {
    position: Types.vec4(),
    rotation: Types.quat(),
    scale: Types.vec4(1, 1, 1, 1),
    visible: Types.bool(true)
  },
  style: {
    opacity: Types.number(1),
    color: Types.color()
  },
  data: {
    position: Types.object(),
    color: Types.object()
  },
  line: {
    width: Types.number(.01)
  },
  view: {
    dimensions: Types.number(3),
    range: Types.array(Types.vec2(-1, 1), 4)
  },
  axis: {
    inherit: Types.bool(true),
    range: Types.vec2(-1, 1),
    dimension: Types.number(1),
    detail: Types.number(1)
  },
  ticks: {
    divide: Types.number(10),
    unit: Types.number(1),
    base: Types.number(10),
    scale: Types.scale(),
    size: Types.number(5)
  }
};

module.exports = Traits;


},{"./types":19}],19:[function(require,module,exports){
var Types;

Types = {
  array: function(type, size) {
    return {
      uniform: function() {
        return type.uniform() + 'v';
      },
      make: function() {
        var i, _i, _results;
        _results = [];
        for (i = _i = 0; 0 <= size ? _i < size : _i > size; i = 0 <= size ? ++_i : --_i) {
          _results.push(type.make());
        }
        return _results;
      },
      validate: function(value, target) {
        var i, replace, _i, _j, _ref, _ref1;
        if ((value.constructor != null) && value.constructor === Array) {
          target.length = size ? size : value.length;
          for (i = _i = 0, _ref = target.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            replace = type.validate(value[i], target[i]);
            if (replace != null) {
              target[i] = replace;
            }
          }
        } else {
          target.length = size;
          for (i = _j = 0, _ref1 = target.length; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
            target[i] = type.value;
          }
        }
      }
    };
  },
  bool: function(value) {
    return {
      uniform: function() {
        return 'f';
      },
      make: function() {
        return !!value;
      },
      validate: function(value) {
        return !!value;
      }
    };
  },
  number: function(value) {
    if (value == null) {
      value = 0;
    }
    return {
      uniform: function() {
        return 'f';
      },
      make: function() {
        return +value;
      },
      validate: function(value) {
        return +value || 0;
      }
    };
  },
  string: function(value) {
    if (value == null) {
      value = '';
    }
    return {
      make: function() {
        return "" + value;
      },
      validate: function(value) {
        return "" + value;
      }
    };
  },
  scale: function(value) {
    return new Types.string(value);
  },
  object: function() {
    return {
      make: function() {
        return {};
      },
      validate: function(value) {
        return value;
      }
    };
  },
  vec2: function(x, y) {
    var defaults;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    defaults = [x, y];
    return {
      uniform: function() {
        return 'v2';
      },
      make: function() {
        return new THREE.Vector2(x, y);
      },
      validate: function(value, target) {
        if (value instanceof THREE.Vector2) {
          target.copy(value);
        } else if ((value != null ? value.constructor : void 0) === Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else {
          target.set(x, y);
        }
      }
    };
  },
  vec3: function(x, y, z) {
    var defaults;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    defaults = [x, y, z];
    return {
      uniform: function() {
        return 'v3';
      },
      make: function() {
        return new THREE.Vector3(x, y, z);
      },
      validate: function(value, target) {
        if (value instanceof THREE.Vector3) {
          target.copy(value);
        } else if ((value != null ? value.constructor : void 0) === Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else {
          target.set(x, y, z);
        }
      }
    };
  },
  vec4: function(x, y, z, w) {
    var defaults;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    if (w == null) {
      w = 0;
    }
    defaults = [x, y, z, w];
    return {
      uniform: function() {
        return 'v4';
      },
      make: function() {
        return new THREE.Vector4(x, y, z, w);
      },
      validate: function(value, target) {
        if (value instanceof THREE.Vector4) {
          target.copy(value);
        } else if ((value != null ? value.constructor : void 0) === Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else {
          target.set(x, y, z, w);
        }
      }
    };
  },
  mat4: function(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
    var defaults;
    if (n11 == null) {
      n11 = 1;
    }
    if (n12 == null) {
      n12 = 0;
    }
    if (n13 == null) {
      n13 = 0;
    }
    if (n14 == null) {
      n14 = 0;
    }
    if (n21 == null) {
      n21 = 0;
    }
    if (n22 == null) {
      n22 = 1;
    }
    if (n23 == null) {
      n23 = 0;
    }
    if (n24 == null) {
      n24 = 0;
    }
    if (n31 == null) {
      n31 = 0;
    }
    if (n32 == null) {
      n32 = 0;
    }
    if (n33 == null) {
      n33 = 1;
    }
    if (n34 == null) {
      n34 = 0;
    }
    if (n41 == null) {
      n41 = 0;
    }
    if (n42 == null) {
      n42 = 0;
    }
    if (n43 == null) {
      n43 = 0;
    }
    if (n44 == null) {
      n44 = 1;
    }
    defaults = [n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44];
    return {
      uniform: function() {
        return 'm4';
      },
      make: function() {
        return new THREE.Matrix4(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44);
      },
      validate: function(value, target) {
        if (value instanceof THREE.Matrix4) {
          target.copy(value);
        } else if ((value != null ? value.constructor : void 0) === Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else {
          target.set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44);
        }
      }
    };
  },
  quat: function(x, y, z, w) {
    var vec4;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    if (w == null) {
      w = 1;
    }
    vec4 = Types.vec4(x, y, z, w);
    return {
      uniform: function() {
        return 'v4';
      },
      make: function() {
        return new THREE.Quaternion;
      },
      validate: function(value, target) {
        var ret;
        if (value instanceof THREE.Quaternion) {
          target.copy(value);
        } else {
          ret = vec4.validate(value, target);
        }
        (ret != null ? ret : target).normalize();
        return ret;
      }
    };
  },
  color: function(r, g, b) {
    var vec3;
    if (r == null) {
      r = .5;
    }
    if (g == null) {
      g = .5;
    }
    if (b == null) {
      b = .5;
    }
    vec3 = Types.vec3(r, g, b);
    return {
      uniform: function() {
        return 'v3';
      },
      make: function() {
        return new THREE.Vector3(r, g, b);
      },
      validate: function(value, target) {
        var string;
        if (value === "" + value) {
          string = value;
          value = new THREE.Color().setStyle(string);
        } else if (value === +value) {
          value = new THREE.Color(value);
        }
        if (value instanceof THREE.Color) {
          target.set(value.r, value.g, value.b);
        } else {
          return vec3.validate(value, target);
        }
      }
    };
  }
};

module.exports = Types;


},{}],20:[function(require,module,exports){
var Group, Range, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Group = require('./group');

Range = require('../../util').Range;

View = (function(_super) {
  __extends(View, _super);

  function View() {
    return View.__super__.constructor.apply(this, arguments);
  }

  View.traits = ['object', 'view'];

  View.prototype.axis = function(dimension) {
    var range;
    return range = this.get('view.range')[dimension - 1];
  };

  View.prototype.to = function(vector) {};

  return View;

})(Group);

module.exports = View;


},{"../../util":43,"./group":15}],21:[function(require,module,exports){
var Buffer, Renderable,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('../renderable');

Buffer = (function(_super) {
  var iterationLimit;

  __extends(Buffer, _super);

  iterationLimit = 0xFFFF;

  function Buffer(gl, shaders, options) {
    if (this.samples == null) {
      this.samples = options.samples || 1;
    }
    if (this.channels == null) {
      this.channels = options.channels || 4;
    }
    Buffer.__super__.constructor.call(this, gl, shaders);
    this.build();
  }

  Buffer.prototype.build = function() {
    return this.uniforms = {
      dataPointer: {
        type: 'v2',
        value: new THREE.Vector2()
      }
    };
  };

  Buffer.prototype.dispose = function() {
    this.data = null;
    this.texture.dispose();
    return Buffer.__super__.dispose.apply(this, arguments);
  };

  Buffer.prototype.update = function() {
    this.iterate();
    return this.write();
  };

  Buffer.prototype.copy = function(data) {
    var i, n, _i;
    n = Math.min(data.length, this.samples * this.channels);
    for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
      this.data[i] = data[i];
    }
    return this.write();
  };

  Buffer.prototype.write = function() {};

  Buffer.prototype.iterate = function() {};

  Buffer.prototype.generate = function() {
    var data, done, limit, p;
    limit = this.samples;
    data = this.data;
    done = false;
    p = 0;
    switch (this.channels) {
      case 1:
        return function(x) {
          if (!done) {
            data[p++] = x || 0;
          }
          return !(done = p >= limit);
        };
      case 2:
        return function(x, y) {
          if (!done) {
            data[p++] = x || 0;
            data[p++] = y || 0;
          }
          return !(done = p >= limit);
        };
      case 3:
        return function(x, y, z) {
          if (!done) {
            data[p++] = x || 0;
            data[p++] = y || 0;
            data[p++] = z || 0;
          }
          return !(done = p >= limit);
        };
      case 4:
        return function(x, y, z, w) {
          if (!done) {
            data[p++] = x || 0;
            data[p++] = y || 0;
            data[p++] = z || 0;
            data[p++] = w || 0;
          }
          return !(done = p >= limit);
        };
    }
  };

  return Buffer;

})(Renderable);

module.exports = Buffer;


},{"../renderable":33}],22:[function(require,module,exports){
exports.Texture = require('./texture');

exports.Buffer = require('./buffer');

exports.LineBuffer = require('./linebuffer');

exports.SurfaceBuffer = require('./surfacebuffer');


},{"./buffer":21,"./linebuffer":23,"./surfacebuffer":24,"./texture":25}],23:[function(require,module,exports){
var Buffer, LineBuffer, Texture,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Buffer = require('./buffer');

Texture = require('./texture');

LineBuffer = (function(_super) {
  __extends(LineBuffer, _super);

  function LineBuffer(gl, shaders, options) {
    this.callback = options.callback || function() {};
    this.width = options.width || 1;
    this.history = options.history || 1;
    this.samples = this.width;
    LineBuffer.__super__.constructor.call(this, gl, shaders, options);
  }

  LineBuffer.prototype.build = function() {
    LineBuffer.__super__.build.apply(this, arguments);
    this.data = new Float32Array(this.samples * this.channels);
    this.texture = new Texture(this.gl, this.samples, this.history, this.channels);
    this.index = 0;
    this.dataPointer = this.uniforms.dataPointer.value;
    return this._adopt(this.texture.uniforms);
  };

  LineBuffer.prototype.iterate = function() {
    var callback, i, output;
    callback = this.callback;
    output = this.generate();
    i = 0;
    while (callback(i++, output) && i < Buffer.iterationLimit) {
      true;
    }
  };

  LineBuffer.prototype.write = function() {
    this.texture.write(this.data, 0, this.index, this.samples, 1);
    this.dataPointer.set(.5, this.index + .5);
    return this.index = (this.index + 1) % this.history;
  };

  return LineBuffer;

})(Buffer);

module.exports = LineBuffer;


},{"./buffer":21,"./texture":25}],24:[function(require,module,exports){
var Buffer, SurfaceBuffer, Texture,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Buffer = require('./buffer');

Texture = require('./texture');

SurfaceBuffer = (function(_super) {
  __extends(SurfaceBuffer, _super);

  function SurfaceBuffer(gl, shaders, options) {
    this.callback = options.callback || function() {};
    this.width = options.width || 1;
    this.height = options.height || 1;
    this.history = options.history || 1;
    this.channels = options.channels || 4;
    this.samples = this.width * this.height;
    SurfaceBuffer.__super__.constructor.call(this, gl, shaders, options);
  }

  SurfaceBuffer.prototype.build = function() {
    SurfaceBuffer.__super__.build.apply(this, arguments);
    this.data = new Float32Array(this.samples * this.channels);
    this.texture = new Texture(this.gl, this.width, this.height * this.history, this.channels);
    this.index = 0;
    this.dataPointer = this.uniforms.dataPointer.value;
    return this._adopt(this.texture.uniforms);
  };

  SurfaceBuffer.prototype.iterate = function() {
    var callback, i, j, k, n, output, repeat;
    callback = this.callback;
    output = this.generate();
    n = this.width;
    i = j = k = 0;
    while (++k < Buffer.iterationLimit) {
      repeat = callback(i, j, output);
      if (!repeat) {
        break;
      }
      if (++i === n) {
        i = 0;
        j++;
      }
    }
  };

  SurfaceBuffer.prototype.write = function() {
    this.texture.write(this.data, 0, this.index, this.width, this.height);
    this.dataPointer.set(.5, this.index + .5);
    return this.index = (this.index + 1) % this.history;
  };

  return SurfaceBuffer;

})(Buffer);

module.exports = SurfaceBuffer;


},{"./buffer":21,"./texture":25}],25:[function(require,module,exports){
var Texture;

Texture = (function() {
  function Texture(gl, width, height, channels) {
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.channels = channels;
    this.n = this.width * this.height * this.channels;
    this.build();
  }

  Texture.prototype.build = function() {
    var gl;
    gl = this.gl;
    this.texture = gl.createTexture();
    this.type = [null, gl.LUMINANCE, gl.LUMINANCE_ALPHA, gl.RGB, gl.RGBA][this.channels];
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    this.data = new Float32Array(this.n);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, this.type, gl.FLOAT, this.data);
    this.textureObject = new THREE.Texture(new Image(), new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter);
    this.textureObject.__webglInit = true;
    this.textureObject.__webglTexture = texture;
    return this.uniforms = {
      dataResolution: {
        type: 'v2',
        value: new THREE.Vector2(1 / this.width, 1 / this.height)
      },
      dataTexture: {
        type: 't',
        value: this.textureObject
      }
    };
  };

  Texture.prototype.write = function(data, x, y, w, h) {
    var gl;
    gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    return gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, w, h, this.type, gl.FLOAT, data);
  };

  Texture.prototype.dispose = function() {
    throw 'Texture::dispose not yet implemented';
  };

  return Texture;

})();

module.exports = Texture;


},{}],26:[function(require,module,exports){
var Factory;

Factory = (function() {
  function Factory(gl, classes, shaders) {
    this.gl = gl;
    this.classes = classes;
    this.shaders = shaders;
  }

  Factory.prototype.getTypes = function() {
    return Object.keys(this.classes);
  };

  Factory.prototype.make = function(type, options, uniforms) {
    return new this.classes[type](this.gl, this.shaders, options, uniforms);
  };

  return Factory;

})();

module.exports = Factory;


},{}],27:[function(require,module,exports){
var Geometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Geometry = (function(_super) {
  __extends(Geometry, _super);

  function Geometry() {
    THREE.BufferGeometry.call(this);
  }

  Geometry.prototype._emitter = function(name) {
    var array, attribute, dimensions, four, offset, one, three, two;
    attribute = this.attributes[name];
    dimensions = attribute.itemSize;
    array = attribute.array;
    offset = 0;
    one = function(a) {
      return array[offset++] = a;
    };
    two = function(a, b) {
      array[offset++] = a;
      return array[offset++] = b;
    };
    three = function(a, b, c) {
      array[offset++] = a;
      array[offset++] = b;
      return array[offset++] = c;
    };
    four = function(a, b, c, d) {
      array[offset++] = a;
      array[offset++] = b;
      array[offset++] = c;
      return array[offset++] = d;
    };
    return [null, one, two, three, four][dimensions];
  };

  return Geometry;

})(THREE.BufferGeometry);

module.exports = Geometry;


},{}],28:[function(require,module,exports){
exports.Geometry = require('./geometry');

exports.LineGeometry = require('./linegeometry');


},{"./geometry":27,"./linegeometry":29}],29:[function(require,module,exports){
var Geometry, LineGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Geometry = require('./geometry');

LineGeometry = (function(_super) {
  __extends(LineGeometry, _super);

  LineGeometry.prototype.shaderAttributes = function() {
    return {
      line: {
        type: 'v2',
        value: null
      }
    };
  };

  LineGeometry.prototype.clip = function(start, end) {
    return this.offsets = [
      {
        start: start * 6,
        count: (end - start) * 6
      }
    ];
  };

  function LineGeometry(options) {
    var base, edge, i, index, j, k, line, points, position, quads, ribbons, samples, segments, strips, triangles, x, y, _i, _j, _k, _l, _m, _n;
    THREE.BufferGeometry.call(this);
    this.samples = samples = +options.samples || 2;
    this.strips = strips = +options.strips || 1;
    this.ribbons = ribbons = +options.ribbons || 1;
    this.segments = segments = samples - 1;
    points = samples * strips * ribbons * 2;
    quads = segments * strips * ribbons;
    triangles = quads * 2;
    this.addAttribute('index', Uint16Array, triangles * 3, 1);
    this.addAttribute('position', Float32Array, points, 3);
    this.addAttribute('line', Float32Array, points, 2);
    index = this._emitter('index');
    position = this._emitter('position');
    line = this._emitter('line');
    base = 0;
    for (i = _i = 0; 0 <= ribbons ? _i < ribbons : _i > ribbons; i = 0 <= ribbons ? ++_i : --_i) {
      for (j = _j = 0; 0 <= strips ? _j < strips : _j > strips; j = 0 <= strips ? ++_j : --_j) {
        for (k = _k = 0; 0 <= samples ? _k <= samples : _k >= samples; k = 0 <= samples ? ++_k : --_k) {
          index(base);
          index(base + 1);
          index(base + 2);
          index(base + 2);
          index(base + 1);
          index(base + 3);
          base += 2;
        }
        base += 2;
      }
    }
    for (i = _l = 0; 0 <= ribbons ? _l < ribbons : _l > ribbons; i = 0 <= ribbons ? ++_l : --_l) {
      y = 0;
      for (j = _m = 0; 0 <= strips ? _m < strips : _m > strips; j = 0 <= strips ? ++_m : --_m) {
        x = 0;
        for (k = _n = 0; 0 <= samples ? _n < samples : _n > samples; k = 0 <= samples ? ++_n : --_n) {
          edge = k === 0 ? -1 : k === segments ? 1 : 0;
          position(x, y, 0);
          position(x, y, 0);
          line(edge, 1);
          line(edge, -1);
          x++;
        }
      }
      y++;
    }
    this.clip(0, quads);
    return;
  }

  return LineGeometry;

})(Geometry);

module.exports = LineGeometry;


},{"./geometry":27}],30:[function(require,module,exports){
var Types;

Types = require('./types');

exports.Scene = require('./scene');

exports.Factory = require('./factory');

exports.Renderable = require('./scene');

exports.Classes = Types.Classes;


},{"./factory":26,"./scene":34,"./types":35}],31:[function(require,module,exports){
exports.Line = require('./line');


},{"./line":32}],32:[function(require,module,exports){
var Line, LineGeometry, Renderable, fragmentShader, vertexShader,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

vertexShader = "\n/*\n//Data sampler\n\nuniform sampler2D dataTexture;\nuniform vec2 dataResolution;\nuniform vec2 dataPointer;\n\nvec2 mapUV(vec2 xy) {\n  return vec2(xy.y, 0);\n}\n\nvec4 sampleData(vec2 xy) {\n  vec2 uv = fract((mapUV(xy) + dataPointer) * dataResolution);\n  vec4 sample = texture2D(dataTexture, uv);\n  return transformData(uv, sample);\n}\n\n*/\n\n/*\n// Grid\nuniform vec2 gridRange;\nuniform vec4 gridAxis;\nuniform vec4 gridOffset;\n\nvec4 transformData(vec2 uv, vec4 data) {\n  return vec4(data.r, 0, 0, 0) + gridAxis * uv.x + gridOffset;\n}\n*/\n\n/*\n// Axis\n*/\nuniform vec4 axisStep;\nuniform vec4 axisPosition;\n\nvec4 sampleData(vec2 uv) {\n  return axisStep * uv.x + axisPosition;\n}\n\n/*\n// Viewport\n*/\nuniform mat4 cartesianMatrix;\n\nvec4 cartesian(vec4 position) {\n//  return cartesianMatrix * vec4(position.xyz, 1.0);\n  return vec4(position.xyz, 1.0);\n}\n\n/*\nvec4 cartesian4(vec4 position) {\n  return cartesian4Matrix * position;\n}\n*/\n\n/*\n// Pipeline\n*/\nvec3 worldToView(vec4 position) {\n  return (modelViewMatrix * vec4(position.xyz, 1.0)).xyz;\n}\n\nvec3 transformToView(vec4 position) {\n  return worldToView(cartesian(position));\n}\n\nvec3 samplePosition(vec2 xy) {\n  vec4 sample = sampleData(xy);\n  return transformToView(sample);\n}\n\n\n/*\n//Line\n*/\n\nvoid getLineGeometry(vec2 xy, float edge, inout vec3 left, inout vec3 center, inout vec3 right) {\n  vec2 step = vec2(1.0, 0.0);\n\n  center = samplePosition(xy);\n  left = (edge < -0.5) ? center : samplePosition(xy - step);\n  right = (edge > 0.5) ? center : samplePosition(xy + step);\n}\n\nvec3 getLineJoin(float edge, vec3 left, vec3 center, vec3 right) {\n  vec3 bitangent;\n  vec3 normal = center;\n\n  vec3 legLeft = center - left;\n  vec3 legRight = right - center;\n\n  if (edge > 0.5) {\n    bitangent = normalize(cross(normal, legLeft));\n  }\n  else if (edge < -0.5) {\n    bitangent = normalize(cross(normal, legRight));\n  }\n  else {\n    vec3 joinLeft = normalize(cross(normal, legLeft));\n    vec3 joinRight = normalize(cross(normal, legRight));\n    float dotLR = dot(joinLeft, joinRight);\n    float scale = min(8.0, tan(acos(dotLR * .999) * .5) * .5);\n    bitangent = normalize(joinLeft + joinRight) * sqrt(1.0 + scale * scale);\n  }\n  \n  return bitangent;\n}\n\nuniform float lineWidth;\nattribute vec2 line;\n//attribute vec3 position;\n\nvec3 getLinePosition() {\n  vec3 left, center, right, join;\n\n  float edge = line.x;\n  float offset = line.y;\n\n  getLineGeometry(position.xy, edge, left, center, right);\n  join = getLineJoin(edge, left, center, right);\n  return center + join * offset * lineWidth;\n}\n\n////\n\nvoid projectPosition(vec3 point) {\n	vec4 glPosition = projectionMatrix * vec4(point, 1.0);\n  gl_Position = glPosition;\n}\n\nvoid main() {\n  vec3 position = getLinePosition();\n  projectPosition(position);\n}";

fragmentShader = "uniform vec3 lineColor;\nuniform float lineOpacity;\n\nvoid main() {\n	gl_FragColor = vec4(lineColor, lineOpacity);\n}";

Renderable = require('../renderable');

LineGeometry = require('../geometry').LineGeometry;

Line = (function(_super) {
  __extends(Line, _super);

  function Line(gl, shaders, options) {
    var f, factory, position, uniforms, v, _ref;
    Line.__super__.constructor.call(this, gl, shaders);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    position = options.position;
    this.geometry = new LineGeometry({
      samples: options.samples || 2,
      strips: options.strips || 1,
      ribbons: options.ribbons || 1
    });
    factory = shaders.material();
    v = factory.vertex;
    if (position) {
      v["import"](position);
    }
    v.call('line.position', uniforms);
    v.call('project.position');
    f = factory.fragment;
    f.call('line.color', uniforms);
    this.material = new THREE.ShaderMaterial(factory.build({
      side: THREE.DoubleSide,
      defaultAttributeValues: null
    }));
    window.material = this.material;
    this.object = new THREE.Mesh(this.geometry, this.material);
    this.object.frustumCulled = false;
  }

  Line.prototype.dispose = function() {
    this.geometry.dispose();
    this.material.dispose();
    this.object = this.geometry = this.material = null;
    return Line.__super__.dispose.apply(this, arguments);
  };

  return Line;

})(Renderable);

module.exports = Line;


},{"../geometry":28,"../renderable":33}],33:[function(require,module,exports){
var Renderable;

Renderable = (function() {
  function Renderable(gl, shaders) {
    this.gl = gl;
    this.shaders = shaders;
    if (this.uniforms == null) {
      this.uniforms = {};
    }
  }

  Renderable.prototype.dispose = function() {
    return this.uniforms = null;
  };

  Renderable.prototype._adopt = function(uniforms) {
    var key, value;
    for (key in uniforms) {
      value = uniforms[key];
      this.uniforms[key] = value;
    }
  };

  Renderable.prototype._set = function(uniforms) {
    var key, value;
    for (key in uniforms) {
      value = uniforms[key];
      if (this.uniforms[key] != null) {
        this.uniforms[key].value = value;
      }
    }
  };

  return Renderable;

})();

module.exports = Renderable;


},{}],34:[function(require,module,exports){
var Scene,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Scene = (function() {
  function Scene(scene) {
    var MathBox;
    this.scene = scene;
    MathBox = (function(_super) {
      __extends(MathBox, _super);

      function MathBox() {
        THREE.Object3D.apply(this);
      }

      return MathBox;

    })(THREE.Object3D);
    this.root = new MathBox;
  }

  Scene.prototype.getRoot = function() {
    return this.root;
  };

  Scene.prototype.inject = function() {
    return this.scene.add(this.root);
  };

  Scene.prototype.unject = function() {
    return this.scene.remove(this.root);
  };

  Scene.prototype.add = function(object) {
    return this.root.add(object);
  };

  Scene.prototype.remove = function(object) {
    return this.root.remove(object);
  };

  return Scene;

})();

module.exports = Scene;


},{}],35:[function(require,module,exports){
var Classes;

Classes = {
  line: require('./meshes').Line,
  databuffer: require('./buffer').DataBuffer,
  linebuffer: require('./buffer').LineBuffer,
  surfacebuffer: require('./buffer').SurfaceBuffer
};

exports.Classes = Classes;


},{"./buffer":22,"./meshes":31}],36:[function(require,module,exports){
var Factory;

Factory = function(snippets) {
  return new ShaderGraph(snippets);
};

module.exports = Factory;


},{}],37:[function(require,module,exports){
exports.Factory = require('./factory');

exports.Snippets = MathBox.Shaders;


},{"./factory":36}],38:[function(require,module,exports){
var Animator;

Animator = (function() {
  function Animator(model) {
    this.model = model;
  }

  Animator.prototype.update = function() {};

  return Animator;

})();

module.exports = Animator;


},{}],39:[function(require,module,exports){
var API;

API = (function() {
  function API(_controller, _animator, _director, _up, _target) {
    var type, _i, _len, _ref;
    this._controller = _controller;
    this._animator = _animator;
    this._director = _director;
    this._up = _up;
    this._target = _target;
    _ref = this._controller.getTypes();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      type = _ref[_i];
      if (type !== 'root' && type !== 'group') {
        (function(_this) {
          return (function(type) {
            return _this[type] = function(options) {
              return _this.add(type, options);
            };
          });
        })(this)(type);
      }
    }
    this._model = this._controller.model;
  }

  API.prototype.add = function(type, options) {
    var node, object, target, _ref;
    node = this._controller.make(type, options);
    target = (_ref = this.target) != null ? _ref : this._controller.getRoot();
    if (!node.children && target === this._controller.getRoot()) {
      target = ((function() {
        var _i, _len, _ref1, _results;
        _ref1 = target.children;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          object = _ref1[_i];
          if (object.children != null) {
            _results.push(object);
          }
        }
        return _results;
      })())[0] || target;
    }
    this._controller.add(node, target);
    if (node.children) {
      return this.push(node);
    } else {
      return this;
    }
  };

  API.prototype.push = function(target) {
    return new API(this._controller, this._animator, this._director, this, target);
  };

  API.prototype.end = function() {
    var _ref;
    return (_ref = this._up) != null ? _ref : this;
  };

  API.prototype.reset = function() {
    return push({
      target: void 0
    });
  };

  return API;

})();

module.exports = API;


},{}],40:[function(require,module,exports){
var Controller;

Controller = (function() {
  function Controller(model, scene, factory) {
    this.model = model;
    this.scene = scene;
    this.factory = factory;
    this.render = (function(_this) {
      return function(event) {
        return _this.scene.add(event.renderable.object);
      };
    })(this);
    this.unrender = (function(_this) {
      return function(event) {
        return _this.scene.remove(event.renderable.object);
      };
    })(this);
  }

  Controller.prototype.getRoot = function() {
    return this.model.getRoot();
  };

  Controller.prototype.getTypes = function() {
    return this.factory.getTypes();
  };

  Controller.prototype.make = function(type, options) {
    return this.factory.make(type, options);
  };

  Controller.prototype.add = function(node, target) {
    if (target == null) {
      target = this.model.getRoot();
    }
    node.primitive.on('render', this.render);
    node.primitive.on('unrender', this.unrender);
    return target.add(node);
  };

  Controller.prototype.remove = function(node) {
    var target;
    target = node.parent || this.model.getRoot();
    target.remove(node);
    node.primitive.off('render', this.render);
    return node.primitive.off('unrender', this.unrender);
  };

  return Controller;

})();

module.exports = Controller;


},{}],41:[function(require,module,exports){
var Director;

Director = (function() {
  function Director(model, script) {
    this.model = model;
    this.script = script;
  }

  return Director;

})();

module.exports = Director;


},{}],42:[function(require,module,exports){
exports.Animator = require('./animator');

exports.API = require('./api');

exports.Controller = require('./controller');

exports.Director = require('./director');


},{"./animator":38,"./api":39,"./controller":40,"./director":41}],43:[function(require,module,exports){
exports.Ticks = require('./ticks');


},{"./ticks":44}],44:[function(require,module,exports){

/*
 Generate equally spaced ticks in a range at sensible positions.
 
 @param min/max - Minimum and maximum of range
 @param n - Desired number of ticks in range
 @param unit - Base unit of scale (e.g. 1 or π).
 @param scale - Division scale (e.g. 2 = binary division, or 10 = decimal division).
 @param inclusive - Whether to add ticks at the edges
 @param bias - Integer to bias divisions one or more levels up or down (to create nested scales)
 */
var linear, log, make;

linear = function(min, max, n, unit, base, inclusive, bias) {
  var distance, edge, factor, factors, i, ideal, ref, span, step, steps, _i, _j, _len, _results;
  n || (n = 10);
  bias || (bias = 0);
  span = max - min;
  ideal = span / n;
  unit || (unit = 1);
  base || (base = 10);
  ref = unit * (bias + Math.pow(base, Math.floor(Math.log(ideal / unit) / Math.log(base))));
  factors = base % 2 === 0 ? [base / 2, 1, 1 / 2] : base % 3 === 0 ? [base / 3, 1, 1 / 3] : [1];
  for (_i = 0, _len = factors.length; _i < _len; _i++) {
    factor = factors[_i];
    steps = ref * factor;
  }
  distance = Infinity;
  step = steps.reduce(function(ref, step) {
    var d;
    d = Math.abs(step - ideal);
    if (d < distance) {
      distance = d;
      return step;
    } else {
      return ref;
    }
  }, ref);
  edge = +(!inclusive);
  min = (Math.ceil(min / step) + edge) * step;
  max = (Math.floor(max / step) - edge) * step;
  n = Math.ceil((max - min) / step);
  _results = [];
  for (i = _j = 0; 0 <= n ? _j <= n : _j >= n; i = 0 <= n ? ++_j : --_j) {
    _results.push(min + x * step);
  }
  return _results;
};


/*
 Generate logarithmically spaced ticks in a range at sensible positions.
 */

log = function(min, max, n, unit, base, inclusive, bias) {
  throw "Log ticks not yet implemented.";

  /*
  base = Math.log(base)
  ibase = 1 / base
  l = (x) -> Math.log(x) * ibase
  
   * Generate linear scale in log space at (base - 1) divisions
  ticks = Linear(l(min), l(max), n, unit, Math.max(2, scale - 1), inclusive, bias)
  
   * Remap ticks within each order of magnitude
  for tick in ticks
    floor = Math.floor tick
    frac = tick - floor
  
    ref = Math.exp floor * base
    value = ref * Math.round 1 + (base - 1) * frac
   */
};

make = function(type, min, max, ticks, unit, base, inclusive, bias) {
  switch (scale) {
    case 'linear':
      return Ticks.linear(min, max, ticks, unit, base, inclusive, bias);
    case 'log':
      return Ticks.log(min, max, ticks, unit, base, inclusive, bias);
  }
};

exports.make = make;

exports.linear = linear;

exports.log = log;


},{}]},{},[3])