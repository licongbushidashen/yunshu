const webpack = require("webpack");
const path = require('path');
const defaultCssVars = require('@cloudpivot/common/styles/variable').mobile;
const extendLessVars = require('./extends/theme');
const modifyVars = Object.assign({}, defaultCssVars, extendLessVars);
const momentIgnore = new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/);
const {
  webpackBar,
  smp,
  gzip,
  analyzer
} = require ('../../bin/common-config');

let pages = {
  main: {
    entry: 'src/main.ts',
    template: 'public/index.html',
    filename: 'index.html',
    chunks: ['chunk-vendors', 'chunk-common', 'chunk-echarts', 'main']
  },
  externalLink: {
    entry: 'src/views/externalLink/apps.ts',
    template: 'src/views/externalLink/el.html',
    filename: 'el.html',
    chunks: ['chunk-vendors', 'chunk-common', 'chunk-echarts', 'externalLink']
  }
};

module.exports = {
  publicPath: '/mobile/',
  pages,
  filenameHashing: true,
  productionSourceMap: true,
  lintOnSave: process.env.NODE_ENV === 'production' ? false : 'error',
  // 处理IE兼容————vuex持久化脚本语法转译
  transpileDependencies: ['vuex-persist', 'flatted','ansi-regex'], // /@cloudpivot\/[\w-]+/],
  //打包分析
  // configureWebpack: smp.wrap({
  //   plugins: [gzip,webpackBar,analyzer],
  // }),
  configureWebpack: config => {
    return {
      plugins: process.env.NODE_ENV === 'production' ? [] : [webpackBar]
    }
  },
  devServer: {
    port: 8089,
    open: false,
    disableHostCheck: true,
    overlay: {
        warnings: false,
        errors: true
    },
    proxy: {
      '/api/': {
        target: process.env.VUE_APP_API + '/',
        // target:  'http://47.106.247.123:8080/',
        // target: 'http://rap2api.taobao.org/',
        changeOrigin: true,
        // pathRewrite: {
        //   '^/api': '', // app/mock/94968
        // },
      },
      '/ddapi/': {
        target: 'https://oapi.dingtalk.com',
        autoRewrite: true,
          pathRewrite: {
            '^/ddapi': ''
          },        
      },
      '/maxkey/': {
        target: process.env.VUE_APP_API_VY + '/',
        changeOrigin: true,
        pathRewrite: {
          '^/maxkey': ''
        },
      },
      '/externalLink/': {
        target: process.env.VUE_APP_API + '/',
        changeOrigin: true,
      },
      '/apis/': {
        target: process.env.VUE_APP_OAUTH_HOST + '/',
        changeOrigin: true,
        pathRewrite: {
          '^/apis': ''
        },
      },
      '/v1/': {
        target: process.env.VUE_APP_PORTAL_HOST + '/',
        changeOrigin: true,
      }
    },
    before: (app) => {
      app.all('*', function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
        res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
        res.header('X-Powered-By', '3.2.1');
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      })
    }
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: modifyVars,
        javascriptEnabled: true
      },
    },
    extract: process.env.NODE_ENV === 'production' ? {
      ignoreOrder: true,
    } : false,
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('assets', path.resolve(__dirname, './src/assets'))
      .set('styles', path.resolve(__dirname, './src/styles'));
    // 删除预加载, preload删除方式一样
    ['main', 'externalLink'].map(name => config.plugins.delete(`prefetch-${name}`))
    config.plugin('ignore')
      .use(momentIgnore);
    // 优化打包
    config.optimization
      .splitChunks({
        minSize: 300000,
        maxInitialRequests: 6,
        cacheGroups: {
          echarts: {
            name: 'chunk-echarts',
            test: /[/]node_modules[/]echarts[/]/,
            chunks: 'all',
            priority: 4,
            reuseExistingChunk:true,
            enforce:true,
          },
          vendors: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            chunks: 'initial'
          },
          common: {
            name: 'chunk-common',
            minChunks: 2,
            priority: -20,
            chunks: 'initial',
            reuseExistingChunk: true
          }
        }
      })
    // 配置打包分析
    // if (process.env.npm_config_report) {
    // config
    //   .plugin('webpack-bundle-analyzer')
    //   .use(BundleAnalyzerPlugin)
    // }
  }
};
