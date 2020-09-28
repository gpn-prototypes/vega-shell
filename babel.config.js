module.exports = {
  // eslint-disable-next-line global-require
  ...require('@gpn-prototypes/frontend-configs/babel.config'),
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules: true,
        regenerator: false,
      },
    ],
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
