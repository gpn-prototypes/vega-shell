const webpackMerge = require('webpack-merge');
const singleSpaDefaults = require('webpack-config-single-spa-ts');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkerPlugin = require('worker-plugin');
const ImportMapPlugin = require('webpack-import-map-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { join } = require('path');

function withTrailingSlash(path) {
  if (path.endsWith('/')) {
    return path;
  }

  return `${path}/`;
}

const systemDependencies = {
  development: {
    'systemjs': 'systemjs/dist/system.js',
    'systemjs-amd': 'systemjs/dist/extras/amd.js',
    'systemjs-named-exports': 'systemjs/dist/extras/named-exports.js',
    'import-map-overrides': 'import-map-overrides/dist/import-map-overrides.js',
  },
  production: {
    'systemjs': 'systemjs/dist/system.min.js',
    'systemjs-amd': 'systemjs/dist/extras/amd.min.js',
    'systemjs-named-exports': 'systemjs/dist/extras/named-exports.min.js',
    'import-map-overrides': 'import-map-overrides/dist/import-map-overrides.js',
  },
};

const sharedDependencies = {
  development: {
    'react': 'react/cjs/react.development.js',
    'react-dom': 'react-dom/cjs/react-dom.development.js',
    'single-spa': 'single-spa/lib/umd/single-spa.dev.js',
    'graphql': 'graphql/index.js',
    '@apollo/client': '@apollo/client/index.js',
  },
  production: {
    'react': 'react/cjs/react.production.min.js',
    'react-dom': 'react-dom/cjs/react-dom.production.min.js',
    'single-spa': 'single-spa/lib/umd/single-spa.min.js',
    'graphql': 'graphql/index.js',
    '@apollo/client': '@apollo/client/apollo-client.cjs.min.js',
  },
};

function getPort(webpackConfigEnv) {
  let port = process.env.PORT || 3000;

  if (webpackConfigEnv !== undefined && 'port' in webpackConfigEnv) {
    port = webpackConfigEnv.port;
  }

  return port;
}

const NODE_ENV = process.env.NODE_ENV || 'development';

const singleSpaConfig = (webpackConfigEnv) => {
  const PORT = getPort(webpackConfigEnv);
  const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

  const importNamesList = Object.keys(sharedDependencies[NODE_ENV])
    .map((key) => `${key}.js`)
    .filter((key) => !Object.keys(systemDependencies[NODE_ENV]).includes(key));

  const orgName = 'vega';
  const defaultConfig = singleSpaDefaults({
    orgName,
    projectName: 'shell',
    webpackConfigEnv,
  });

  defaultConfig.plugins = defaultConfig.plugins.filter((plugin) => {
    return !(plugin instanceof CleanWebpackPlugin);
  });

  const config = webpackMerge.smart(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    name: 'single-spa',
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

const systemConfig = {
  name: 'system-js',
  entry: {
    ...systemDependencies[NODE_ENV],
  },
  devtool: 'sourcemap',
  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
    path: join(__dirname, 'dist'),
  },
};

module.exports = [singleSpaConfig, systemConfig];
