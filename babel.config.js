module.exports = {
  presets: [
    '@babel/preset-env',
  ],
  env: {
    development: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
      ],
    },
  },
};

