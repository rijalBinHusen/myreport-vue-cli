const { defineConfig } = require('@vue/cli-service')
const path = require("path")

module.exports = defineConfig({
  transpileDependencies: true,
  css: {
    extract: false
  },
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
    resolve: {
      alias: {
        '@/': path.resolve(__dirname, 'src/')
      }
    }
  },
  publicPath: "./",
})
