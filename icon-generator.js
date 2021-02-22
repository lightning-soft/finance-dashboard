const svgtofont = require('svgtofont');
const path = require('path');

svgtofont({
  src: path.resolve(process.cwd(), 'src/assets/img/svg'), // svg path
  dist: path.resolve(process.cwd(), 'src/assets/icon-font'), // output path
  fontName: 'icon', // font name
  css: true,
  svgicons2svgfont: {
    fontHeight: 1000,
    normalize: true
  },
}).then(() => {
  console.log('done!');
});
