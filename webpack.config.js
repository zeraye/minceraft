const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.fs$/i,
        use: "raw-loader",
      },
      {
        test: /\.vs$/i,
        use: "raw-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts"],
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist/assets/js"),
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};
