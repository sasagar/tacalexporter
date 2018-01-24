'use strict';

// Electronのモジュール
const electron = require('electron');
const {shell} = require('electron');

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
var google = require('googleapis');
const {OAuth2Client} = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
		process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';
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
			var test = authorizeChecker(JSON.parse(content));
			return test;
		})
		.then((res) => {
			event.returnValue = res;
		});
		// var res = authorizeChecker(JSON.parse(content));
		// console.log(res);
		// event.returnValue = res;
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
	fs.readFile(TOKEN_PATH, function (err, token) {
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
	});
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
function listEvents (auth) {
	var calendar = google.calendar('v3');
	calendar.events.list({
		auth: auth,
		calendarId: '',
		timeMin: (new Date()).toISOString(),
		maxResults: 10,
		singleEvents: true,
		orderBy: 'startTime'
	}, function (err, response) {
		if (err) {
			console.log('The API returned an error: ' + err);
			return;
		}
		var events = response.items;
		if (events.length === 0) {
			console.log('No upcoming events found.');
		} else {
			console.log('Upcoming 10 events:');
			for (var i = 0; i < events.length; i++) {
				var event = events[i];
				var start = event.start.dateTime || event.start.date;
				console.log('%s - %s', start, event.summary);
			}
		}
	});
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function addEvents (auth, option) {
	var calendar = google.calendar('v3');
	var timezone = 'Asia/Tokyo';

	var schedule = option.data.schedule;
	var title = option.data.title;
	var calID = option.calID;

	for (var i in schedule) {
		var eventData = {
			'summary': title,
			'start': {
				'dateTime': schedule[i].start,
				'timeZone': timezone
			},
			'end': {
				'dateTime': schedule[i].end,
				'timeZone': timezone
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
			console.log('There was an error contacting the Calendar service: ' + err);
			return;
		}
		event.returnValue = list.data.items;
	});
}
