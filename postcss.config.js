const createPostcssConfig = require('@gpn-prototypes/frontend-configs/postcss.config');

module.exports = {
  ...createPostcssConfig(),
  plugins: [...createPostcssConfig().plugins],
};
