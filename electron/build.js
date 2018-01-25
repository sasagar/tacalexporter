var packager = require('electron-packager');
var config = require('./package.json');

/*eslint no-console: ["error", { allow: ["warn", "log", "dir", "error"] }] */
/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "appPath" }]*/

packager({
	dir: './',					// 対象
	out: '../dist',			// 出力先
	name: config.name,	// 名前
	platform: 'darwin', // or win32
	arch: 'x64',				// 64bit
	version: '1.8.1',	// electron のバージョン
	icon: './build/icon.icns', // アイコン

	'app-bundle-id': 'com.kent-and-co.tacalexporter', // ドメイン
	'app-version': config.version,					// バージョン

	overwrite: true,	// 上書き
	asar: true,			 // アーカイブ
	prune: true,
	// 無視ファイル
	ignore: 'node_modules/(electron-packager|electron-prebuilt|.bin)|release.js',
}, function done (err, appPath) {
	if (err) {
		throw new Error(err);
	}
	console.log('Done!!');
});
