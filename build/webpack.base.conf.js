'use strict'
const path = require('path')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  context: resolve('/'),
  entry: { 
    'renderer': resolve('src/app.ts'),
  },
  output: {
    filename: '[name].js',
    path: process.env.NODE_ENV === 'production' ? config.build.assetsRoot : config.dev.assetsRoot,
    publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath
  },
  target: 'electron-renderer',
  resolve: {
    extensions: ['.js', '.vue', '.json', '.ts'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      'assets': resolve('src/assets'),
      'jquery': "jquery/src/jquery",
    }
  },
  module: {
    rules: [
      { 
        test: /\.vue$/, 
        use: [
          {
            loader: 'vue-loader',
            options: vueLoaderConfig
          }
        ]
      },
      {
        test: /\.(ttf|woff|woff2|eot|otf|svg|node|bmp|png|jpg|jpeg|gif|ico)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 0,
              outputPath: 'assets',
            }
          }
        ]
      },
      {
        test: /\.css$/, 
        use: [
          { loader: 'vue-style-loader' },
          { loader: 'css-loader' },
        ]
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader:'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
            }
          }
        ],
      },
      {
        test: /\.(scss|sass)$/, use: [
          { loader: 'vue-style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ]
      }
    ]
  },
  plugins: []
}
