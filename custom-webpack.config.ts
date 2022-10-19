import type { Configuration } from 'webpack';

module.exports = {
  entry: { 
    background: 'src/background/background.ts',
    page: 'src/page/page.ts',
  },
  optimization: {
    runtimeChunk: false,
  }
} as Configuration;