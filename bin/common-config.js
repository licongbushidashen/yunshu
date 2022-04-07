
// 打包分析
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// gzip压缩
const Compression = require('compression-webpack-plugin');
// 时间分析
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
// 进度统计
const WebpackBar = require('webpackbar');

const webpackBar = new WebpackBar();
const smp = new SpeedMeasurePlugin({
    outputFormat: 'human'
});
const gzip = new Compression({
    algorithm: 'gzip',
    test:/\.js$|\.html$|\.css/,
    threshold: 10240,
    minRatio: 0.8,
    deleteOriginalAssets: false
});

const analyzer = new BundleAnalyzerPlugin();

module.exports = {
    webpackBar,
    smp,
    gzip,
    analyzer
}
