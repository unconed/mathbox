(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Context, Primitives, Render, Stage;

Stage = require('./stage');

Render = require('./render');

Primitives = require('./primitives');

Context = (function() {
  function Context(scene, camera, script) {
    if (script == null) {
      script = [];
    }
    this.attributes = new Primitives.Attributes(Primitives.Types.Traits);
    this.factory = new Primitives.Factory(Primitives.Types.Classes, this.attributes);
    this.model = new Stage.Model(this.factory.make('root'), camera);
    this.animator = new Stage.Animator(this.model);
    this.controller = new Stage.Controller(this.model);
    this.director = new Stage.Director(this.controller, this.animator, script);
    this.scene = new Render.Scene(scene, camera);
    this.api = new Stage.API(this.controller, this.animator, this.director, this.factory);
  }

  Context.prototype.init = function() {
    return this.scene.init();
  };

  Context.prototype.destroy = function() {
    this.scene.destroy();
    return this.model = this.animator = this.controller = this.director = this.factory = this.api = null;
  };

  Context.prototype.update = function() {
    this.animator.update();
    return this.attributes.digest();
  };

  return Context;

})();

exports.Context = Context;


},{"./primitives":5,"./render":13,"./stage":20}],2:[function(require,module,exports){
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


/*
 */

Context = require('./context').Context;

THREE.Bootstrap.registerPlugin('mathbox', {
  defaults: {
    init: true
  },
  listen: ['ready', 'update'],
  install: function(three) {
    return three.MathBox = {
      init: (function(_this) {
        return function(options) {
          var camera, scene, script;
          scene = (options != null ? options.scene : void 0) || _this.options.scene || three.scene;
          camera = (options != null ? options.camera : void 0) || _this.options.camera || three.camera;
          script = (options != null ? options.script : void 0) || _this.options.script;
          _this.context = new Context(scene, camera, script);
          _this.context.api.three = three;
          return three.mathbox = _this.context.api;
        };
      })(this),
      destroy: (function(_this) {
        return function() {
          delete three.mathbox;
          delete _this.context.api.three;
          return delete _this.context;
        };
      })(this)
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


},{"./context":1}],3:[function(require,module,exports){

/*
 Custom attribute model
 - Avoids copying objects when setting
 - Coalesces update notification per object
 */
var Attributes, Data;

Attributes = (function() {
  function Attributes(traits) {
    this.traits = traits;
    this.pending = [];
  }

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
    var callback, calls, _i, _len, _ref;
    _ref = [this.pending, []], calls = _ref[0], this.pending = _ref[1];
    for (_i = 0, _len = calls.length; _i < _len; _i++) {
      callback = calls[_i];
      callback();
    }
  };

  return Attributes;

})();

Data = (function() {
  function Data(object, traits, attributes) {
    var change, changes, digest, dirty, get, key, makers, name, options, set, spec, trait, validate, validators, values, _i, _len, _ref;
    if (traits == null) {
      traits = [];
    }
    get = (function(_this) {
      return function(key) {
        if (key != null) {
          return _this[key];
        } else {
          return _this;
        }
      };
    })(this);
    set = (function(_this) {
      return function(key, value) {
        var replace;
        replace = validate(key, value, _this[key]);
        if (replace != null) {
          _this[key] = replace;
        }
        return change(key);
      };
    })(this);
    object.get = get;
    object.set = function(key, value) {
      var options;
      if (arguments.length >= 2) {
        if (validators[key] != null) {
          set(key, value);
        }
      } else {
        options = key;
        for (key in options) {
          value = options[key];
          if (validators[key] != null) {
            set(key, value);
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
        return changes[key] = _this[key];
      };
    })(this);
    digest = function() {
      var changed;
      changed = changes;
      changes = {};
      dirty = false;
      return object.trigger({
        type: 'change',
        changed: changed
      });
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
        this[key] = options.make();
        change(key);
        makers[key] = options.make;
        validators[key] = options.validate;
      }
    }
  }

  return Data;

})();

exports.Attributes = Attributes;


},{}],4:[function(require,module,exports){
var Factory;

Factory = (function() {
  function Factory(classes, attributes) {
    this.classes = classes;
    this.attributes = attributes;
  }

  Factory.prototype.getTypes = function() {
    return Object.keys(this.classes);
  };

  Factory.prototype.make = function(type, options) {
    return new this.classes[type](options, this.attributes);
  };

  return Factory;

})();

exports.Factory = Factory;


},{}],5:[function(require,module,exports){
exports.Factory = require('./factory').Factory;

exports.Primitive = require('./primitive').Primitive;

exports.Attributes = require('./attributes').Attributes;

exports.Types = require('./types');


},{"./attributes":3,"./factory":4,"./primitive":6,"./types":10}],6:[function(require,module,exports){
var Primitive;

Primitive = (function() {
  function Primitive(options, attributes) {
    this.attributes = attributes.apply(this, this.traits);
    this.set(options);
  }

  Primitive.prototype.extend = function() {
    if (this.traits == null) {
      this.traits = [];
    }
    return this.traits = [].concat.apply(this.traits, arguments);
  };

  return Primitive;

})();

THREE.Binder.apply(Primitive.prototype);

exports.Primitive = Primitive;


},{}],7:[function(require,module,exports){
var Cartesian, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('./view').View;

Cartesian = (function(_super) {
  __extends(Cartesian, _super);

  function Cartesian(options, attributes) {
    Cartesian.__super__.constructor.call(this, options, attributes);
  }

  return Cartesian;

})(View);

exports.Cartesian = Cartesian;


},{"./view":12}],8:[function(require,module,exports){
var Grid, Primitive,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../primitive').Primitive;

Grid = (function(_super) {
  __extends(Grid, _super);

  function Grid(options, attributes) {
    this.extend('line', 'object', 'view', 'grid', 'axis:axis1', 'axis:axis2');
    Grid.__super__.constructor.call(this, options, attributes);
  }

  return Grid;

})(Primitive);

exports.Grid = Grid;


},{"../primitive":6}],9:[function(require,module,exports){
var Group, Primitive,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../primitive').Primitive;

Group = (function(_super) {
  __extends(Group, _super);

  function Group(options, attributes) {
    this.children = [];
    Group.__super__.constructor.call(this, options, attributes);
  }

  Group.prototype.add = function(primitive) {
    return this.children.push(primitive);
  };

  Group.prototype.remove = function(primitive) {
    var child;
    return this.children = (function() {
      var _i, _len, _ref, _results;
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child !== primitive) {
          _results.push(child);
        }
      }
      return _results;
    }).call(this);
  };

  return Group;

})(Primitive);

exports.Group = Group;


},{"../primitive":6}],10:[function(require,module,exports){
var Classes, Traits, Types;

Classes = {
  grid: require('./grid').Grid,
  root: require('./root').Root,
  view: require('./view').View,
  cartesian: require('./cartesian').Cartesian
};

Types = {
  array: function(type, size) {
    return {
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
  vec2: function(x, y) {
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    return {
      make: function() {
        return new THREE.Vector2(x, y);
      },
      validate: function(value, target) {
        var _ref, _ref1;
        if (value instanceof THREE.Vector2) {
          target.copy(value);
        } else if ((value != null ? value.constructor : void 0) === Array) {
          target.set((_ref = value[0]) != null ? _ref : x, (_ref1 = value[1]) != null ? _ref1 : y);
        } else {
          target.set(x, y);
        }
      }
    };
  },
  vec3: function(x, y, z) {
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    return {
      make: function() {
        return new THREE.Vector3(x, y, z);
      },
      validate: function(value, target) {
        var _ref, _ref1, _ref2;
        if (value instanceof THREE.Vector3) {
          target.copy(value);
        } else if ((value != null ? value.constructor : void 0) === Array) {
          target.set((_ref = value[0]) != null ? _ref : x, (_ref1 = value[1]) != null ? _ref1 : y, (_ref2 = value[2]) != null ? _ref2 : z);
        } else {
          target.set(x, y, z);
        }
      }
    };
  },
  vec4: function(x, y, z, w) {
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
    return {
      make: function() {
        return new THREE.Vector4(x, y, z, w);
      },
      validate: function(value, target) {
        var _ref, _ref1, _ref2, _ref3;
        if (value instanceof THREE.Vector4) {
          target.copy(value);
        } else if ((value != null ? value.constructor : void 0) === Array) {
          target.set((_ref = value[0]) != null ? _ref : x, (_ref1 = value[1]) != null ? _ref1 : y, (_ref2 = value[2]) != null ? _ref2 : z, (_ref3 = value[3]) != null ? _ref3 : w);
        } else {
          target.set(x, y, z, w);
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
      make: function() {
        return new THREE.Vector3();
      },
      validate: function(value, target) {
        if (value === +value) {
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

Traits = {
  object: {
    position: Types.vec4(),
    rotation: Types.quat(),
    scale: Types.vec4(1, 1, 1, 1)
  },
  line: {
    width: Types.number(1),
    color: Types.color()
  },
  surface: {
    color: Types.color()
  },
  view: {
    range: Types.array(Types.vec2(-1, 1), 4)
  },
  grid: {
    axes: Types.vec2(0, 1)
  },
  axis: {
    inherit: Types.bool(),
    ticks: Types.number(10),
    unit: Types.number(1),
    base: Types.number(10),
    detail: Types.number(2),
    scale: Types.scale()
  }
};

exports.Classes = Classes;

exports.Types = Types;

exports.Traits = Traits;


},{"./cartesian":7,"./grid":8,"./root":11,"./view":12}],11:[function(require,module,exports){
var Group, Root,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Group = require('./group').Group;

Root = (function(_super) {
  __extends(Root, _super);

  function Root(options, attributes) {
    Root.__super__.constructor.call(this, options, attributes);
  }

  return Root;

})(Group);

exports.Root = Root;


},{"./group":9}],12:[function(require,module,exports){
var Group, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Group = require('./group').Group;

View = (function(_super) {
  __extends(View, _super);

  function View(options, attributes) {
    this.extend('object', 'view');
    View.__super__.constructor.call(this, options, attributes);
  }

  return View;

})(Group);

exports.View = View;


},{"./group":9}],13:[function(require,module,exports){
exports.Scene = require('./scene').Scene;

exports.Render = require('./render').Render;


},{"./render":14,"./scene":15}],14:[function(require,module,exports){
var Render;

Render = (function() {
  function Render() {}

  return Render;

})();

exports.Render = Render;


},{}],15:[function(require,module,exports){
var Scene;

Scene = (function() {
  function Scene(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.renderTree = new THREE.Object3D;
  }

  Scene.prototype.init = function() {
    return this.scene.add(this.renderTree);
  };

  Scene.prototype.destroy = function() {
    return this.scene.remove(this.renderTree);
  };

  return Scene;

})();

exports.Scene = Scene;


},{}],16:[function(require,module,exports){
var Animator;

Animator = (function() {
  function Animator(model) {
    this.model = model;
  }

  Animator.prototype.update = function() {};

  return Animator;

})();

exports.Animator = Animator;


},{}],17:[function(require,module,exports){
var API;

API = (function() {
  function API(_controller, _animator, _director, _factory, _up, state) {
    var key, value;
    this._controller = _controller;
    this._animator = _animator;
    this._director = _director;
    this._factory = _factory;
    this._up = _up;
    if (state == null) {
      state = {};
    }
    this._factory.getTypes().forEach((function(_this) {
      return function(type) {
        return _this[type] = function(options) {
          return _this.add(type, options);
        };
      };
    })(this));
    for (key in state) {
      value = state[key];
      this[key] = value;
    }
    this._model = this._controller.model;
  }

  API.prototype.add = function(type, options) {
    var primitive, state;
    primitive = this._factory.make(type, options);
    this._controller.add(primitive, this.target);
    state = {
      target: primitive
    };
    if (primitive.children) {
      return this.push(state);
    } else {
      return this;
    }
  };

  API.prototype.push = function(state) {
    return new API(this._controller, this._animator, this._director, this._factory, this, state);
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

exports.API = API;


},{}],18:[function(require,module,exports){
var Controller;

Controller = (function() {
  function Controller(model, director) {
    this.model = model;
    this.director = director;
  }

  Controller.prototype.add = function(primitive, target) {
    if (target == null) {
      target = this.model.getRoot();
    }
    if (!primitive.children && target === this.model.getRoot() && target.children.length) {
      target = target.children[0];
    }
    return target.add(primitive);
  };

  return Controller;

})();

exports.Controller = Controller;


},{}],19:[function(require,module,exports){
var Director;

Director = (function() {
  function Director(model, script) {
    this.model = model;
    this.script = script;
  }

  return Director;

})();

exports.Director = Director;


},{}],20:[function(require,module,exports){
exports.Animator = require('./animator').Animator;

exports.API = require('./api').API;

exports.Controller = require('./controller').Controller;

exports.Director = require('./director').Director;

exports.Model = require('./model').Model;


},{"./animator":16,"./api":17,"./controller":18,"./director":19,"./model":21}],21:[function(require,module,exports){
var Model;

Model = (function() {
  function Model(root, camera) {
    this.root = root;
    this.camera = camera;
  }

  Model.prototype.getRoot = function() {
    return this.root;
  };

  return Model;

})();

exports.Model = Model;


},{}]},{},[2])