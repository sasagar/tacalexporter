'use strict';

/*eslint no-console: ["error", { allow: ["warn", "log", "dir", "error"] }] */

// Electronのモジュール
const electron = require('electron');
const {shell, Menu, app, ipcMain} = require('electron');

// pathモジュール
const path = require('path');

// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;

// 外部JSの読み込み
const nf = require('./app/nodeFunc');
const em = require('./app/electronMenu');
const gg = require('./app/google');

// configを使う。
const Config = require('electron-config');

// ウィンドウサイズの基準
const config = new Config({
	defaults: {
		bounds: {
			width: 800,
			height: 600
		},
		calendar: {
			selected: ''
		},
		credentials: {
			token: ''
		}
	}
});

// スコープの設定
// カレンダーAPIと個人情報用のAPIを許可するようにスコープ指定
var SCOPES = [
	'https://www.googleapis.com/auth/calendar',
	'https://www.googleapis.com/auth/userinfo.profile'
];

// TOKENは設定ファイルに保存
var TOKEN = config.get('credentials.token');

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow;

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', () => {
	app.quit();
});

// Electronの初期化完了後に実行
app.on('ready', () => {
	// メイン画面の表示。
	const {width, height, x, y} = config.get('bounds');
	mainWindow = new BrowserWindow({ title: 'TechAcademyメンタリングカレンダー登録', width, height, x, y, webPreferences: { nodeIntegration: true } });
	mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));

	['resize', 'move'].forEach(ev => {
		mainWindow.on(ev, () => {
			config.set('bounds', mainWindow.getBounds());
		});
	});

	// ウィンドウが閉じられたらアプリも終了
	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	// メニューを作る
	const template = em.template;

	if (process.platform === 'darwin') {
		template.unshift(em.darwinTemplate.main);

		// Edit menu
		template[1].submenu.push(em.darwinTemplate.sub1);

		// Window menu
		template[3].submenu = em.darwinTemplate.sub2;
	}

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
});

ipcMain.on('applySchedule', (event, obj) => {
	var test = nf.scheduleMaker(obj);
	var title = nf.eventTitleMaker(obj);

	var resObj = {
		title: title,
		schedule: test
	};
	event.returnValue = resObj;
});

ipcMain.on('addschedule', async (event, option) => {
	try {
		var content = await gg.getClientSecret();
		authorize(content, gg.addEvents, {option, mainWindow});
	} catch (e) {
		console.error('Error loading client secret file: ' + e);
		console.error('addschedule');
		console.log(__dirname);
		return;
	}
});

ipcMain.on('getCalendarList', async (event) => {
	try {
		var content = await gg.getClientSecret();
		authorize(content, gg.listCalendar, event);
	} catch (e) {
		console.error('Error loading client secret file: ' + e);
		console.error('getCalendarList');
		console.log(__dirname);
		return;
	}
});

ipcMain.on('getProfileData', async (event) => {
	try {
		var content = gg.getClientSecret();
		authorize(content, gg.userInfo, event);
	} catch (e) {
		console.error('Error loading client secret file: ' + e);
		console.error('getProfileData');
		console.log(__dirname);
		return;
	}
});

ipcMain.on('changeCalendar', (event, calval) => {
	config.set('calendar.selected', calval);
});

ipcMain.on('getSelectedCalendar', (event) => {
	var data = config.get('calendar.selected');
	event.returnValue = data;
});

ipcMain.on('launchChecker', async (event) => {
	try {
		var content = await gg.getClientSecret();
		var res = await authorizeChecker(content);
		event.returnValue = res;
	} catch (e) {
		console.error('Error loading client secret file: ' + e);
		console.error('launchChecker');
		console.log(__dirname);
		return;
	}
});

ipcMain.on('tokenSubmit', async (event, code) => {
	try {
		var credentials = await gg.getClientSecret();
		var oauth2Client = gg.OAuth2(credentials);

		oauth2Client.getToken(code, (err, token) => {
			if (err) {
				console.log('Error while trying to retrieve access token', err);
				event.returnValue = false;
			}
			oauth2Client.credentials = token;
			config.set('credentials.token', token);
			// リロードした時用に再代入
			TOKEN = config.get('credentials.token');
			event.returnValue = true;
		});
	} catch (e) {
		console.error('Error loading client secret file: ' + e);
		console.error('tokenSubmit');
		console.log(__dirname);
		event.returnValue = false;
	}
});

/**
 * TOKENがあるかどうかをチェック
 *
 * @param {Object} credentials The authorization client credentials.
 * @return {String}     OK / auth認証用のURL のいずれか
 */
function authorizeChecker (credentials) {
	var res;
	// Check if we have previously stored a token.
	if (TOKEN === '') {
		var oauth2Client = gg.OAuth2(credentials);
		var authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES
		});
		shell.openExternal(authUrl);
		res = authUrl;
	} else {
		res = 'OK';
	}
	// });
	return res;
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 * @param {Object} option callbackに渡したいオプション。第2引数になる。
 */
function authorize (credentials, callback, option) {
	var oauth2Client = gg.OAuth2(credentials);

	if (TOKEN === '') {
		var authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES
		});
		shell.openExternal(authUrl);
	} else {
		oauth2Client.credentials = TOKEN;
		if (option) {
			callback(oauth2Client, option);
		} else {
			callback(oauth2Client);
		}
	}
}
