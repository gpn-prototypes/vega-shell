const base = require('@gpn-prototypes/frontend-configs/babel.config');

module.exports = {
  ...base,
  plugins: ['transform-class-properties'],
};
