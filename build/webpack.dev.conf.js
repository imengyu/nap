'use strict'
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const exec = require('child_process').exec;
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const chalk = require('chalk')
const path = require('path')
const portfinder = require('portfinder')

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: config.dev.host,
    port: config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    disableHostCheck: true,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  optimization: {
    namedModules: true,
    noEmitOnErrors: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),  
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: 'html-withimg-loader!./src/app.html',
      filename: 'index.html', inject: true,
      minify: { minifyCSS: true, minifyJS: true, collapseWhitespace: true, removeComments: true }
    }),
    new VueLoaderPlugin(),
  ]
})


let electronStarted = false

module.exports = new Promise((resolve, reject) => {

  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`页面运行在这里: http://${devWebpackConfig.devServer.host}:${port}`],
        },
      }))

      //Start Electron

      devWebpackConfig.plugins.push({
        apply: (compiler) => {
          compiler.hooks.done.tap('StartElectron', compilation => {
            if(!electronStarted) {
              electronStarted = true;
    
              setTimeout(() => {
                
                console.log(chalk.green('Staring electron'));
                exec(`cross-env NODE_ENV=developnment electron ./src/main-process --debug-path 'http://${devWebpackConfig.devServer.host}:${port}'`, (error, stdout, stderr) => {
                  if(error) {
                    console.log(chalk.yellow('Can not start electron'));
                    console.log(chalk.red(error));
                    electronStarted = false;
                    return;
                  }
                  console.log(chalk.yellow('Electron quited'));
                  electronStarted = false;
                });
              }, 1000)
            }
          });
        }
      })

      resolve(devWebpackConfig)
    }
  })
})
