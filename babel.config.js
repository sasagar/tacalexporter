const MomentLocalesPlugin = require("moment-locales-webpack-plugin");
module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  plugins: [
    // To strip all locales except “en”
    new MomentLocalesPlugin(),

    // Or: To strip all locales except “en”, “es-us” and “ru”
    // (“en” is built into Moment and can’t be removed)
    new MomentLocalesPlugin({
      localesToKeep: ["ja"],
    }),
  ],
};
