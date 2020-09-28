module.exports = {
  hooks: {
    ...require('@gpn-prototypes/frontend-configs/.huskyrc.js').hooks,
    'pre-push': 'yarn test',
  },
};
