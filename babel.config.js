const base = require('@gpn-prototypes/frontend-configs/babel.config');

module.exports = {
  ...base,
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules: true,
        regenerator: false,
      },
    ],
    'transform-class-properties',
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: 'current node',
          },
        ],
      ],
    },
  },
};
