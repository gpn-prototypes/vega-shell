const createPostcssConfig = require('@gpn-prototypes/frontend-configs/postcss.config');

const config = createPostcssConfig();

module.exports = {
  ...config,
  plugins: [...config.plugins],
};
