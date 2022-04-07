module.exports = {
  presets: [
    ['@vue/app',
      {
        modules: "commonjs",
      }
    ]
  ],
  plugins: [
    ['import', { libraryName: '@h3/antd-vue', libraryDirectory: 'lib', style: true }, '@h3/antd-vue'],
    ['import', { libraryName: '@h3/report', libraryDirectory: 'lib', style: true }, '@h3/report'],
    ['import', { libraryName: '@h3/thinking-ui', libraryDirectory: 'lib', style: true }, '@h3/thinking-ui'],
    ['import', { libraryName: '@h3/awesome-ui', libraryDirectory: 'lib', style: true }, '@h3/awesome-ui']
  ]
};
