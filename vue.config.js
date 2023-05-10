const { defineConfig } = require("@vue/cli-service");
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = defineConfig({
  transpileDependencies: true,
  //声明配置webpack
  configureWebpack: {
    resolve: {
      //配置路径别名
      alias: {
        src: "@",
      },
      modules: ["node_modules"]
    },
    plugins: [new NodePolyfillPlugin()],
  },
});
