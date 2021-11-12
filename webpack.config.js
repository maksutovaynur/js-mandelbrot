//use strict
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: __dirname + "/src/app/index.js", // webpack entry point. Module to start building dependency graph
  output: {
    path: __dirname + '/dist', // Folder to store generated bundle
    filename: 'bundle.js',  // Name of generated bundle after build
    publicPath: '' // public URL of the output directory when referenced in a browser
  },
  mode: 'development',
  module: {
      rules: [
          {
              test: /\.s[ac]ss$/i,
              use: [
                  // Creates `style` nodes from JS strings
                  "style-loader",
                  // Translates CSS into CommonJS
                  "css-loader",
                  // Compiles Sass to CSS
                  "sass-loader",
              ],
          },
          {
              test: /\.(glsl|vs|fs|vert|frag)$/,
              type: 'asset/source',
          },
          {
              test: /\.(png|svg|jpg|jpeg|gif)$/i,
              type: 'asset/inline',
          },
      ],

  },
  plugins: [
      new HtmlWebpackPlugin({
          template: __dirname + "/src/public/index.html",
          inject: 'body'
      })
  ],
  devServer: {
      static: './src/public',
      port: 8888,
      host: "0.0.0.0",
      allowedHosts: 'all'
  }
};
