const CracoLessPlugin = require('craco-less')
const path = require('path')
// const pxtorem = require("postcss-pxtorem");
// const pxtovw = require("postcss-px-to-viewport")


module.exports = {
  webpack: {
    alias: {
      '@':path.join(__dirname,'./src')
    }
  },
  babel: {
    plugins: [
      ['import', { libraryName: 'antd', style: true }],
      ['@babel/plugin-proposal-decorators', { legacy: true }]
    ]
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#428BE5'
            },
            javascriptEnabled: true
          }
        }
      }
    }
  ],
  style:{
    postcss: {
      plugins: [
        // pxtorem({
        //   rootValue: 19.2, // 设计稿宽度/100，即分成多少份
        //   unitPrecision: 6, // 小数精度
        //   propList: ['*'],
        //   selectorBlackList: [],
        //   replace: true,
        //   mediaQuery: false,
        //   minPixelValue: 0,
        //   // exclude: /node_modules/i,
        // }),
        // pxtovw({
        //   viewportWidth:1920,
        //   viewportHeight:1080,
        //   propList: ['*'],
        //   viewportUnit:"vw",
        //   fontViewportUnit: 'vw', 
        //   selectorBlackList: ['.ignore'],
        //   mediaQuery: false,
        //   replace: true,
        //   exclude: [/node_modules/],
        // })
      ],
    },
  }
}
