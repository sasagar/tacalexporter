module.exports = {
  css: {
    loaderOptions: {
      // pass options to sass-loader
      // @/ is an alias to src/
      // so this assumes you have a file named `src/variables.sass`
      // Note: this option is named as "prependData" in sass-loader v8
      //   sass: {
      //     additionalData: `@import "~@/variables.sass"`,
      //   },
      // by default the `sass` option will apply to both syntaxes
      // because `scss` syntax is also processed by sass-loader underlyingly
      // but when configuring the `prependData` option
      // `scss` syntax requires an semicolon at the end of a statement, while `sass` syntax requires none
      // in that case, we can target the `scss` syntax separately using the `scss` option
      scss: {
        additionalData: `@import "~@/assets/sass/neumorphism.scss";`,
      },
    },
  },
  pages: {
    index: {
      entry: "src/main.js",
      title: "TechAcademy Mentor Console",
    },
  },
  configureWebpack: {
    devtool: "source-map",
    performance: {
      maxAssetSize: 2100000,
      maxEntrypointSize: 2100000,
    },
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false,
    },
    electronBuilder: {
      mainProcessWatch: ["googleApi.js", "auto-update.js"],
      builderOptions: {
        extraResources: ["src/preload.js"],
        productName: "TechAcademy Mentor Console",
        appId: "com.kent-and-co.tacalexport.vue",
        afterSign: "./scripts/notarize.js",
        win: {
          electronUpdaterCompatibility: ">=2.16",
          target: [
            {
              target: "nsis",
              arch: ["x64", "ia32"],
            },
          ],
          publish: {
            provider: "github",
            releaseType: "release",
            vPrefixedTagName: true,
          },
          icon: "./assets/icon.png",
        },
        mac: {
          electronUpdaterCompatibility: ">=2.16",
          target: [
            {
              target: "default",
              arch: ["x64", "arm64"],
            },
          ],
          publish: {
            provider: "github",
            releaseType: "release",
            vPrefixedTagName: true,
          },
          icon: "./assets/icon.png",
          hardenedRuntime: true,
          gatekeeperAssess: false,
          entitlements: "build/entitlements.mac.plist",
          entitlementsInherit: "build/entitlements.mac.plist",
        },
      },
    },
  },
};
