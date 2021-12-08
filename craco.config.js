const CracoLessPlugin = require('craco-less')
const path = require('path')

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
  ]
}
