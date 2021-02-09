const fs = require('fs');
const less = require('less');
const LessPluginCleanCSS = require('less-plugin-clean-css');
// const themeVars = require('ng-zorro-antd/dark-theme');
const themeVars = require('./ng-zorro-theme');

const appStyles = 'node_modules/ng-zorro-antd/ng-zorro-antd.less'; // style entry path for the application
const themeContent = `@import '${appStyles}';`;
console.log('themeVars', themeVars)
less.render(themeContent, {
  javascriptEnabled: true,
  plugins: [new LessPluginCleanCSS({ advanced: true })],
  modifyVars: {
    ...themeVars
  }
}).then(data => {
  fs.writeFileSync(
    // output path for the theme style
    './src/assets/ant/dark.css',
    data.css
  )
}).catch(e => {
  // log the render error
  console.error(e);
});
