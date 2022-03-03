const path = require("path");
const baseConfig = require("./webpack.config.base");

const libraryName = "MathBox";
const PATHS = {
  entryPoint: path.resolve(__dirname, "../src/index.js"),
  bundles: path.resolve(__dirname, "../build"),
};

const config = {
  entry: {
    "mathbox-bundle": [PATHS.entryPoint],
    "mathbox.min": [PATHS.entryPoint],
  },
  externals: {
    three: "THREE",
    "three/src/cameras/PerspectiveCamera.js": "THREE",
    "three/src/constants.js": "THREE",
    "three/src/core/BufferAttribute.js": "THREE",
    "three/src/core/BufferGeometry.js": "THREE",
    "three/src/core/Object3D.js": "THREE",
    "three/src/geometries/PlaneGeometry.js": "THREE",
    "three/src/materials/MeshBasicMaterial.js": "THREE",
    "three/src/materials/RawShaderMaterial.js": "THREE",
    "three/src/math/Color.js": "THREE",
    "three/src/math/Euler.js": "THREE",
    "three/src/math/Matrix3.js": "THREE",
    "three/src/math/Matrix4.js": "THREE",
    "three/src/math/Vector2.js": "THREE",
    "three/src/math/Vector3.js": "THREE",
    "three/src/math/Vector4.js": "THREE",
    "three/src/math/Quaternion.js": "THREE",
    "three/src/objects/Mesh.js": "THREE",
    "three/src/renderers/WebGLRenderTarget.js": "THREE",
    "three/src/scenes/Scene.js": "THREE",
    "three/src/textures/Texture.js": "THREE",
  },

  // The output defines how and where we want the bundles. The special value
  // `[name]` in `filename` tell Webpack to use the name we defined above. We
  // target a UMD and name it MyLib. When including the bundle in the browser it
  // will be accessible at `window.MyLib`
  output: {
    path: PATHS.bundles,
    filename: "[name].js",
    libraryTarget: "umd",
    library: libraryName,
    umdNamedDefine: true,
  },
  ...baseConfig,
};

module.exports = config;
