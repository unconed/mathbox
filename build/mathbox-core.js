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
    this.factory = new Primitives.Factory;
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
    return this.animator.update();
  };

  return Context;

})();

exports.Context = Context;

},{"./primitives":4,"./render":10,"./stage":17}],2:[function(require,module,exports){
var Context, mathBox;

exports.version = '2';

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

exports.mathBox = mathBox;

if (typeof window !== "undefined" && window !== null) {
  window.mathBox = mathBox;
  window.MathBox = exports;
}

},{"./context":1}],3:[function(require,module,exports){
var Factory, types;

types = require('./types').types;

Factory = (function() {
  function Factory() {
    this.types = types;
  }

  Factory.prototype.getTypes = function() {
    return Object.keys(this.types);
  };

  Factory.prototype.make = function(type, options) {
    return new this.types[type](options);
  };

  return Factory;

})();

exports.Factory = Factory;

},{"./types":6}],4:[function(require,module,exports){
exports.Factory = require('./factory').Factory;

exports.Primitive = require('./primitive').Primitive;

},{"./factory":3,"./primitive":5}],5:[function(require,module,exports){
var Primitive, PrimitiveGroup,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = (function() {
  function Primitive() {}

  return Primitive;

})();

PrimitiveGroup = (function(_super) {
  __extends(PrimitiveGroup, _super);

  function PrimitiveGroup() {
    this.children = [];
    PrimitiveGroup.__super__.constructor.apply(this, arguments);
  }

  PrimitiveGroup.prototype.add = function(primitive) {
    return this.children.push(primitive);
  };

  PrimitiveGroup.prototype.remove = function(primitive) {
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

  return PrimitiveGroup;

})(Primitive);

exports.Primitive = Primitive;

exports.PrimitiveGroup = PrimitiveGroup;

},{}],6:[function(require,module,exports){
var types;

types = {
  grid: require('./types/grid').primitive,
  root: require('./types/root').primitive,
  viewport: require('./types/viewport').primitive
};

exports.types = types;

},{"./types/grid":7,"./types/root":8,"./types/viewport":9}],7:[function(require,module,exports){
var Grid, Primitive,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../primitive').Primitive;

Grid = (function(_super) {
  __extends(Grid, _super);

  function Grid() {
    return Grid.__super__.constructor.apply(this, arguments);
  }

  return Grid;

})(Primitive);

exports.primitive = Grid;

},{"../primitive":5}],8:[function(require,module,exports){
var PrimitiveGroup, Root,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PrimitiveGroup = require('../primitive').PrimitiveGroup;

Root = (function(_super) {
  __extends(Root, _super);

  function Root() {
    return Root.__super__.constructor.apply(this, arguments);
  }

  return Root;

})(PrimitiveGroup);

exports.primitive = Root;

},{"../primitive":5}],9:[function(require,module,exports){
var PrimitiveGroup, Viewport,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PrimitiveGroup = require('../primitive').PrimitiveGroup;

Viewport = (function(_super) {
  __extends(Viewport, _super);

  function Viewport() {
    return Viewport.__super__.constructor.apply(this, arguments);
  }

  return Viewport;

})(PrimitiveGroup);

exports.primitive = Viewport;

},{"../primitive":5}],10:[function(require,module,exports){
exports.Scene = require('./scene').Scene;

exports.Render = require('./render').Render;

},{"./render":11,"./scene":12}],11:[function(require,module,exports){
var Render;

Render = (function() {
  function Render() {}

  return Render;

})();

exports.Render = Render;

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
var Animator;

Animator = (function() {
  function Animator(model) {
    this.model = model;
  }

  Animator.prototype.update = function() {};

  return Animator;

})();

exports.Animator = Animator;

},{}],14:[function(require,module,exports){
var API;

API = (function() {
  function API(_controller, _animator, _director, _factory) {
    this._controller = _controller;
    this._animator = _animator;
    this._director = _director;
    this._factory = _factory;
    this._factory.getTypes().forEach((function(_this) {
      return function(type) {
        return _this[type] = function(options) {
          var primitive;
          primitive = _this._factory.make(type, options);
          return _this._controller = _this._controller.add(primitive);
        };
      };
    })(this));
  }

  API.prototype.end = function() {
    return this._controller.pop();
  };

  return API;

})();

exports.API = API;

},{}],15:[function(require,module,exports){
var Controller;

Controller = (function() {
  function Controller(model, director, previous, target) {
    this.model = model;
    this.director = director;
    this.previous = previous;
    this.target = target != null ? target : this.model.getRoot();
    console.log('ctor', this.target);
  }

  Controller.prototype.add = function(primitive) {
    this.target.add(primitive);
    console.log('add', this.target, primitive, primitive.children);
    if (primitive.children) {
      return this.push(primitive);
    } else {
      return this;
    }
  };

  Controller.prototype.push = function(primitive) {
    return new Controller(this.model, this.director, this, primitive);
  };

  Controller.prototype.pop = function() {
    var _ref;
    return (_ref = this.previous) != null ? _ref : this;
  };

  return Controller;

})();

exports.Controller = Controller;

},{}],16:[function(require,module,exports){
var Director;

Director = (function() {
  function Director(model, script) {
    this.model = model;
    this.script = script;
  }

  return Director;

})();

exports.Director = Director;

},{}],17:[function(require,module,exports){
exports.Animator = require('./animator').Animator;

exports.API = require('./api').API;

exports.Controller = require('./controller').Controller;

exports.Director = require('./director').Director;

exports.Model = require('./model').Model;

},{"./animator":13,"./api":14,"./controller":15,"./director":16,"./model":18}],18:[function(require,module,exports){
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