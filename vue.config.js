const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  //声明配置webpack
  configureWebpack: {
    resolve: {
      //配置路径别名
      alias: {
        src: "@",
      },
    },
  },
});
