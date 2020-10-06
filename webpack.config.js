const webpackMerge = require('webpack-merge');
const singleSpaDefaults = require('webpack-config-single-spa-ts');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkerPlugin = require('worker-plugin');
const ImportMapPlugin = require('webpack-import-map-plugin');

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

function withTrailingSlash(path) {
  if (path.endsWith('/')) {
    return path;
  }

  return `${path}/`;
}

module.exports = (webpackConfigEnv) => {
  const orgName = 'vega';
  const defaultConfig = singleSpaDefaults({
    orgName,
    projectName: 'shell',
    webpackConfigEnv,
  });

  return webpackMerge.smart(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    devServer: {
      historyApiFallback: true,
      proxy: {
        '/graphql': 'http://outsourcing.nat.tepkom.ru:38300/',
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: false,
        template: 'src/index.ejs',
        templateParameters: {
          isLocal: webpackConfigEnv && webpackConfigEnv.isLocal === 'true',
          baseUrl: BASE_URL,
          orgName,
        },
      }),
      new WorkerPlugin({ sharedWorker: true }),
      new ImportMapPlugin({
        fileName: 'import-map.json',
        baseUrl: withTrailingSlash(BASE_URL),
        filter(x) {
          return ['main.js'].includes(x.name);
        },
        transformKeys(filename) {
          if (filename === 'main.js') {
            return '@vega/shell';
          }

          return undefined;
        },
      }),
    ],
  });
};
