const webpack = require("webpack");
const path = require('path');
const themeVars = require('@h3/theme-pc/presets/cloudpivot/back');
const defaultCssVars = require('@cloudpivot/common/styles/variable').admin;
const extendLessVars = require('./extends/theme');
const modifyVars = Object.assign({}, defaultCssVars, extendLessVars);
themeVars.modifyVars = Object.assign(themeVars.modifyVars, modifyVars)
const CopyWebpackPlugin = require('copy-webpack-plugin');
// monaco
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const copy = new CopyWebpackPlugin([
  {
    from: path.resolve(__dirname, '../../modules/@cloudpivot/form/src/renderer/components/pc/input-textarea/tinymcelib'),
    to: 'tinymcelib',
    ignore: ['.*']
  }
]);
const lang = new MonacoWebpackPlugin({
  languages: ["javascript", "css", "html", "json"]
});
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
    filename: 'index.html'
  },
  template: {
    entry: 'src/template/index.ts'
  }
};
if (process.env.NODE_ENV === 'debug') {
  // pages.template = Object.assign(pages.template,{
  //     template: 'src/template/index.html', //开发环境页面
  //     filename: 'template.html'
  // });
  /**
   * 开发环境的ROOT模板测试路径
   */
  pages.rooTemplate = {
    entry: 'src/template/index.ts',
    template: 'src/template/rootTemplate.html',
    filename: 'rootTemplate.html'
  };
}

module.exports = {
  publicPath: '/admin/',
  pages: pages,
  parallel: false,
  filenameHashing: true,
  productionSourceMap: false,
  transpileDependencies: ['vuex-persist', 'flatted','ansi-regex'],// /@cloudpivot\/[\w-]+/],
  // 打包分析
  // configureWebpack: smp.wrap({
  //   plugins: [copy, lang, gzip, webpackBar, analyzer],
  // }),
  configureWebpack: config => {
    return {
      plugins: process.env.NODE_ENV === 'production' ?[
        lang,
        copy
      ]: [lang, copy, webpackBar]
    };
  },
  devServer: {
    port: 9000,
    open: true,
    proxy: {
      '/api/': {
        target: process.env.VUE_APP_API + '/',
        changeOrigin: true,
        // pathRewrite: {
        //   '^/api': '', // app/mock/94968
        // },
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
        if (req.method == 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      })
    }
  },
  css: {
    extract: process.env.NODE_ENV === 'production' ? {
      ignoreOrder: true,
    } : false,
    loaderOptions: {
      less: {
        ...themeVars,
        modifyVars: modifyVars,
        javascriptEnabled: true,
      },
    },
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('assets', path.resolve(__dirname, './src/assets'))
      .set('styles', path.resolve(__dirname, './src/styles'))
    config.plugin('ignore')
        .use(momentIgnore)
    // 配置打包分析
    if (process.env.npm_config_report) {
      config
        .plugin('webpack-bundle-analyzer')
        .use(analyzer)
    }
    // 删除预加载
    ['main', 'template', 'rooTemplate'].map(name => config.plugins.delete(`prefetch-${name}`))

    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap(options => Object.assign(options, { limit: 1024 }))

      config
        .plugin('mini-css-extract-plugin')
        .use('mini-css-extract-plugin')
        .tap(options => Object.assign(options, { ignoreOrder: true }))
    // 优化打包
    config.optimization
        .splitChunks({
          minSize: 300000,
          maxInitialRequests: 6,
          cacheGroups: {
            h3print: {
              name: 'h3print',
              test: /[\\/]node_modules[\\/]@h3print[\\/]/,
              minSize: 0,
              minChunks: 1,
              priority: 9,
              reuseExistingChunk: true,
              chunks: 'all'
            },
            h3icon: {
              name: 'h3icon',
              test: /[\\/]node_modules[\\/]@h3-icons[\\/]/,
              minSize: 0,
              minChunks: 1,
              priority: 8,
              reuseExistingChunk: true,
              chunks: 'all'
            },
            xlsx: {
              name: 'xlsx',
              test: /[\\/]node_modules[\\/]xlsx[\\/]/,
              minSize: 0,
              minChunks: 1,
              priority: 7,
              reuseExistingChunk: true,
              chunks: 'all'
            },
            echarts: {
              name: 'echarts',
              test: /[\\/]node_modules[\\/]echarts[\\/]/,
              chunks: 'all',
              priority: 6,
              reuseExistingChunk:true,
              enforce:true,
            },
            vendors: {
              name: `chunk-vendors`,
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              chunks: 'initial'
            },
            common: {
              name: `chunk-common`,
              minChunks: 2,
              priority: -20,
              chunks: 'initial',
              reuseExistingChunk: true
            }
          }
        })
    // config.module.rule('ts').use('ts-loader').tap(options => Object.assign(options, {
    //   getCustomTransformers: () => ({
    //     before: [ tsImportPluginFactory([
    //       {
    //         libraryName: 'h3-awesome-ui',
    //         libraryDirectory: 'lib',
    //         style: true,
    //       }])]
    //   }),
    //   // include: path.join(__dirname, 'node_modules/h3-antd-pro/components'),
    // }));
  }
};
