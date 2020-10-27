const webpackMerge = require('webpack-merge');
const singleSpaDefaults = require('webpack-config-single-spa-ts');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkerPlugin = require('worker-plugin');
const ImportMapPlugin = require('webpack-import-map-plugin');

function withTrailingSlash(path) {
  if (path.endsWith('/')) {
    return path;
  }

  return `${path}/`;
}

const sharedDependencies = {
  development: {
    'react': 'react/cjs/react.development.js',
    'react-dom': 'react-dom/cjs/react-dom.development.js',
    // '@apollo/client': '@apollo/client',
    'single-spa': 'single-spa/lib/umd/single-spa.dev.js',
    // 'graphql': 'graphql',
  },
  production: {
    'react': 'react/cjs/react.production.js',
    'react-dom': 'react-dom/cjs/react-dom.production.js',
    'single-spa': 'single-spa/lib/umd/single-spa.min.js',
  },
};

function getPort(webpackConfigEnv) {
  let port = process.env.PORT || 3000;

  if (webpackConfigEnv !== undefined && 'port' in webpackConfigEnv) {
    port = webpackConfigEnv.port;
  }

  return port;
}

module.exports = (webpackConfigEnv) => {
  const PORT = getPort(webpackConfigEnv);
  const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

  const NODE_ENV = process.env.NODE_ENV || 'development';
  const importNamesList = Object.keys(sharedDependencies[NODE_ENV]).map((key) => `${key}.js`);

  const orgName = 'vega';
  const defaultConfig = singleSpaDefaults({
    orgName,
    projectName: 'shell',
    webpackConfigEnv,
  });

  const config = webpackMerge.smart(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    devServer: {
      historyApiFallback: true,
      proxy: {
        '/graphql': 'http://outsourcing.nat.tepkom.ru:38300/',
      },
    },
    entry: {
      'vega-shell': defaultConfig.entry,
      ...sharedDependencies[NODE_ENV],
    },
    output: {
      filename: '[name].js',
    },
    externals: Object.keys(sharedDependencies[NODE_ENV]),
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
          return ['vega-shell.js', ...importNamesList].includes(x.name);
        },
        transformKeys(filename) {
          if (filename === 'vega-shell.js') {
            return '@vega/shell';
          }

          if (filename === 'apollo-client.js') {
            return '@apollo/client';
          }

          const extIndex = filename.indexOf('.js');

          if (extIndex > -1) {
            return filename.slice(0, extIndex);
          }

          return undefined;
        },
      }),
    ],
  });

  return config;
};
