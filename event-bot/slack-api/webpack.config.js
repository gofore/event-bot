const path = require('path');

module.exports = {
  entry: './src/app.js',
  "target": "node",
  output: {
    filename: '../../build/main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};