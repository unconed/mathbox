const path = require("path");
const baseConfig = require("./webpack.config.base");

const libraryName = "MathBox";
const PATHS = {
  entryPoint: path.resolve(__dirname, "../src/index.js"),
  bundles: path.resolve(__dirname, "../build/bundle"),
};

const config = {
  ...baseConfig,
  entry: {
    mathbox: [PATHS.entryPoint],
    "mathbox.min": [PATHS.entryPoint],
  },
  externals: {
    three: "THREE",
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
};

module.exports = config;
