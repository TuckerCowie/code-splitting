const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');

// Okay, this may be confusing at first glance but go through it step-by-step
module.exports = env => {
  const ifProd = plugin =>  env.prod ? plugin : undefined;
  const removeEmpty = array => array.filter(p => !!p);

  return {
    /**
     * entry tells webpack where to start looking.
     * In this case we have both an app and vendor file.
     */
    entry: {
      app: path.join(__dirname, '../src/'),
      vendor: Object.keys(pkg.dependencies),
    },
    /**
     * output tells webpack where to put the files he creates
     * after running all its loaders and plugins.
     */
    output: {
      filename: env.prod ? '[name].[chunkhash].js' : '[name].js',
      chunkFilename: env.prod ? '[id].[chunkhash].js' : '[id].js',
      path: path.join(__dirname, '../build/'),
    },

    module: {
      // Loaders allow you to preprocess files!
      loaders: [
        {
          test: /\.(js)$/, // look for .js files
          exclude: /node_modules/, // ingore /node_modules
          loader: 'babel', // preprocess with that babel goodness
          query: {
            cacheDirectory: true,
          },
        },
      ],
    },

    plugins: removeEmpty([
      new webpack.optimize.CommonsChunkPlugin({
        name: ['vendor', 'manifest'],
        minChunks: Infinity,
        filename: '[name].[chunkhash].js',
      }),

      /**
      * HtmlWebpackPlugin will make sure out JavaScriot files are being called
      * from within our index.html
      */
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '../src/index.ejs'),
        filename: 'index.html',
        inject: 'body',
      }),

      new InlineManifestWebpackPlugin(),

      // Only running DedupePlugin() and UglifyJsPlugin() in production
      ifProd(new webpack.optimize.DedupePlugin()),
      ifProd(new webpack.optimize.UglifyJsPlugin({
        compress: {
          'screw_ie8': true,
          'warnings': false,
          'unused': true,
          'dead_code': true,
        },
        output: {
          comments: false,
        },
        sourceMap: false,
      })),
    ]),
  };
};
