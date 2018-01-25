'use strict';

/*eslint no-console: ["error", { allow: ["warn", "log", "dir", "error"] }] */

// Electronのモジュール
const electron = require('electron');
const {shell, Menu} = require('electron');

// pathモジュール
const path = require('path');

// アプリケーションをコントロールするモジュール
const app = electron.app;

// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;

// ipcRenderer
const {ipcMain} = require('electron');

// nodeFuncの読み込み
const nf = require('./app/nodeFunc.js');

// configを使う。
const Config = require('electron-config');

// about window
// const openAboutWindow = require('about-window').default;

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

// GoogleCalendar
var fs = require('fs');
var readline = require('readline');
const google = require('googleapis');
const {OAuth2Client} = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = [
	'https://www.googleapis.com/auth/calendar',
	'https://www.googleapis.com/auth/userinfo.profile'
];
// var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
// 		process.env.USERPROFILE) + '/.credentials/';
// var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';
var TOKEN = config.get('credentials.token');

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow;

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function () {
	app.quit();
});

// Electronの初期化完了後に実行
app.on('ready', function () {
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
	mainWindow.on('closed', function () {
		mainWindow = null;
	});

	const template = [
		{
			label: '編集',
			submenu: [
				{role: 'undo', label: '取り消し'},
				{role: 'redo', label: 'やり直し'},
				{type: 'separator'},
				{role: 'cut', label: '切り取り'},
				{role: 'copy', label: 'コピー'},
				{role: 'paste', label: '貼り付け'},
				{role: 'delete', label: '削除'},
				{role: 'selectall', label: '全てを選択'}
			]
		},
		{
			label: '表示',
			submenu: [
				{role: 'reload', label: '再読み込み'},
				{role: 'forcereload', label: '強制再読み込み'},
				{type: 'separator'},
				{role: 'resetzoom', label: '拡大率リセット'},
				{role: 'zoomin', label: '拡大'},
				{role: 'zoomout', label: '縮小'},
				{type: 'separator'},
				{role: 'togglefullscreen', label: '全画面表示'}
			]
		},
		{
			role: 'ウィンドウ',
			submenu: [
				{role: 'minimize', label: '最小化'},
				{role: 'close', label: '閉じる'}
			]
		},
		{
			role: 'ヘルプ',
			submenu: [
				{
					label: 'Electronについて',
					click () { require('electron').shell.openExternal('https://electron.atom.io'); }
				}
			]
		}
	];

	if (process.platform === 'darwin') {
		template.unshift({
			label: app.getName(),
			submenu: [
				{role: 'about', label: 'このアプリについて'},
				{type: 'separator'},
				{role: 'services', label: 'サービス', submenu: []},
				{type: 'separator'},
				{role: 'hide', label: 'このアプリを隠す'},
				{role: 'hideothers', label: '他のアプリを隠す'},
				{role: 'unhide', label: '全てを表示'},
				{type: 'separator'},
				{role: 'quit', label: '終了'}
			]
		});

		// Edit menu
		template[1].submenu.push(
			{type: 'separator'},
			{
				label: '読み上げ',
				submenu: [
					{role: 'startspeaking', label: '開始'},
					{role: 'stopspeaking', label: '停止'}
				]
			}
		);

		// Window menu
		template[3].submenu = [
			{role: 'close', label: '閉じる'},
			{role: 'minimize', label: '最小化'},
			{role: 'zoom', label: '拡大'},
			{type: 'separator'},
			{role: 'front', label: '全面へ'}
		];
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

ipcMain.on('addschedule', (event, obj) => {
	fs.readFile(path.join(__dirname, '/client_secret.json'), function processClientSecrets (err, content) {
		if (err) {
			console.log('Error loading client secret file: ' + err);
			console.log(__dirname);
			return;
		}
		// authorize(JSON.parse(content), listEvents);
		authorize(JSON.parse(content), addEvents, obj);
	});
});

ipcMain.on('getCalendarList', (event) => {
	fs.readFile(path.join(__dirname, '/client_secret.json'), function processClientSecrets (err, content) {
		if (err) {
			console.log('Error loading client secret file: ' + err);
			console.log(__dirname);
			return;
		}
		authorize(JSON.parse(content), listCalendar, event);
	});
});

ipcMain.on('getProfileData', (event) => {
	fs.readFile(path.join(__dirname, '/client_secret.json'), function processClientSecrets (err, content) {
		if (err) {
			console.log('Error loading client secret file: ' + err);
			console.log(__dirname);
			return;
		}
		authorize(JSON.parse(content), userInfo, event);
	});
});

ipcMain.on('changeCalendar', (event, calval) => {
	config.set('calendar.selected', calval);
});

ipcMain.on('getSelectedCalendar', (event) => {
	var data = config.get('calendar.selected');
	event.returnValue = data;
});

ipcMain.on('launchChecker', (event) => {
	fs.readFile(path.join(__dirname, '/client_secret.json'), function processClientSecrets (err, content) {
		if (err) {
			console.log('Error loading client secret file: ' + err);
			console.log(__dirname);
			return;
		}
		Promise.resolve()
			.then(() => {
				var res = authorizeChecker(JSON.parse(content));
				return res;
			})
			.then((res) => {
				event.returnValue = res;
			});
	});
});

ipcMain.on('tokenSubmit', (event, code) => {
	fs.readFile(path.join(__dirname, '/client_secret.json'), function processClientSecrets (err, content) {
		if (err) {
			console.log('Error loading client secret file: ' + err);
			console.log(__dirname);
			event.returnValue = false;
		}
		var credentials = JSON.parse(content);

		var clientSecret = credentials.installed.client_secret;
		var clientId = credentials.installed.client_id;
		var redirectUrl = credentials.installed.redirect_uris[0];
		var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

		oauth2Client.getToken(code, function (err, token) {
			if (err) {
				console.log('Error while trying to retrieve access token', err);
				event.returnValue = false;
			}
			oauth2Client.credentials = token;
			storeToken(token);
			event.returnValue = true;
		});
	});
});

// Load client secrets from a local file.
// fs.readFile('client_secret.json', function processClientSecrets (err, content) {
//	if (err) {
//		console.log('Error loading client secret file: ' + err);
//		return;
//	}
// Authorize a client with the loaded credentials, then call the
// Google Calendar API.
// authorize(JSON.parse(content), listEvents);
// });

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorizeChecker (credentials) {
	// リロードした時用に再読み込み
	TOKEN = config.get('credentials.token');
	var res;
	// Check if we have previously stored a token.
	// fs.readFile(TOKEN_PATH, function (err, token) {
	if (TOKEN === '') {
		var clientSecret = credentials.installed.client_secret;
		var clientId = credentials.installed.client_id;
		var redirectUrl = credentials.installed.redirect_uris[0];

		var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
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
 */
function authorize (credentials, callback, option) {
	var clientSecret = credentials.installed.client_secret;
	var clientId = credentials.installed.client_id;
	var redirectUrl = credentials.installed.redirect_uris[0];
	var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	/* fs.readFile(TOKEN_PATH, function (err, token) {
		if (err) {
			getNewToken(oauth2Client, callback);
		} else {
			oauth2Client.credentials = JSON.parse(token);
			if (option) {
				callback(oauth2Client, option);
			} else {
				callback(oauth2Client);
			}
		}
	}); */
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

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *		 client.
 */
function getNewToken (oauth2Client, callback) {
	var authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES
	});
	console.log('Authorize this app by visiting this url: ', authUrl);
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question('Enter the code from that page here: ', function (code) {
		rl.close();
		oauth2Client.getToken(code, function (err, token) {
			if (err) {
				console.log('Error while trying to retrieve access token', err);
				return;
			}
			oauth2Client.credentials = token;
			storeToken(token);
			callback(oauth2Client);
		});
	});
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken (token) {
	/* try {
		fs.mkdirSync(TOKEN_DIR);
	} catch (err) {
		if (err.code !== 'EEXIST') {
			throw err;
		}
	} */
	// fs.writeFile(TOKEN_PATH, JSON.stringify(token));
	// console.log('Token stored to ' + TOKEN_PATH);
	config.set('credentials.token', token);
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function addEvents (auth, option) {
	var calendar = google.calendar('v3');

	var schedule = option.data.schedule;
	var title = option.data.title;
	var calID = option.calID;

	for (var i in schedule) {
		var eventData = {
			'summary': title,
			'start': {
				'dateTime': schedule[i].start
			},
			'end': {
				'dateTime': schedule[i].end
			}
		};

		var apiObj = {
			'auth': auth,
			'calendarId': calID,
			'resource': eventData
		};

		calendar.events.insert(apiObj, function (err, event) {
			if (err) {
				console.log('There was an error contacting the Calendar service: ' + err);
				return;
			}
			console.log('Event created: ' + event.data.summary);
			mainWindow.webContents.send('resultMessage', event.data);
		});
	}
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listCalendar (auth, event) {
	var calendar = google.calendar('v3');
	var apiObj = {'auth': auth};

	calendar.calendarList.list(apiObj, function (err, list) {
		if (err) {
			console.log('There was an error contacting the Calendar service at listCalendar: ' + err);
			return;
		}
		event.returnValue = list.data.items;
	});
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function userInfo (auth, event) {
	var profApi = google.oauth2('v2');
	var apiObj = {'auth': auth};

	profApi.userinfo.v2.me.get(apiObj, function (err, prof) {
		if (err) {
			console.log('There was an error contacting the Profile service: ' + err);
			return;
		}
		event.returnValue = prof.data;
	});
}
