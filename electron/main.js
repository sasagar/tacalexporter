'use strict';

/*eslint no-console: ["error", { allow: ["warn", "log", "dir", "error"] }] */

// Electronのモジュール
const {
	shell,
	Menu,
	app,
	ipcMain,
	dialog,
	BrowserWindow,
} = require('electron');

// pathモジュール
const path = require('path');

// 外部JSの読み込み
const nf = require('./app/nodeFunc');
const nc = require('./app/nodeCommon');
const em = require('./app/electronMenu');
const gg = require('./app/google');
const au = require('./app/updater');

// 設定のデフォルトを指定
const { config } = require('./app/defaultConf.js');

// スコープの設定
// カレンダーAPIと個人情報用のAPIを許可するようにスコープ指定
let SCOPES = [
	'https://www.googleapis.com/auth/calendar',
	'https://www.googleapis.com/auth/userinfo.profile',
];

// TOKENは設定ファイルに保存
let TOKEN = config.get('credentials.token');

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow;
let splashWindow;
let loadingWindow;
let settingWindow;

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', () => {
	app.quit();
});

// Electronの初期化完了後に実行
app.on('ready', () => {
	// メイン画面の表示。
	const { width, height, x, y } = config.get('bounds');
	mainWindow = new BrowserWindow({
		title: 'TechAcademyメンタリングカレンダー登録',
		width,
		height,
		x,
		y,
		webPreferences: { nodeIntegration: true },
		show: false,
	});

	splashWindow = new BrowserWindow({
		width: 320,
		height: 320,
		frame: false,
		transparent: true,
		parent: mainWindow,
	});
	splashWindow.setAlwaysOnTop(true);

	loadingWindow = new BrowserWindow({
		width: 320,
		height: 320,
		frame: false,
		transparent: true,
		parent: mainWindow,
		show: false,
	});
	loadingWindow.setAlwaysOnTop(true);

	settingWindow = new BrowserWindow({
		modal: true,
		parent: mainWindow,
		show: false,
	});
	loadingWindow.setAlwaysOnTop(true);

	mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));
	splashWindow.loadURL(path.join('file://', __dirname, '/splash.html'));
	loadingWindow.loadURL(path.join('file://', __dirname, '/loading.html'));
	settingWindow.loadURL(path.join('file://', __dirname, '/settings.html'));

	mainWindow.webContents.on('did-finish-load', async () => {
		await mainWindow.show();
		au.checkUpdate();
		setTimeout(() => {
			if (splashWindow) {
				splashWindow.close();
			}
		}, 2000);
	});

	splashWindow.on('closed', () => (splashWindow = null));

	['resize', 'move'].forEach(ev => {
		mainWindow.on(ev, () => {
			config.set('bounds', mainWindow.getBounds());
		});
	});

	// ウィンドウが閉じられたらアプリも終了
	mainWindow.on('closed', () => {
		splashWindow = null;
		loadingWindow = null;
		settingWindow = null;
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

ipcMain.on('logout', () => {
	dialog.showMessageBox(
		settingWindow,
		{
			type: 'warning',
			buttons: ['キャンセル', 'ログアウト'],
			defaltId: 0,
			title: 'Googleカレンダーからログアウト',
			message: 'Googleカレンダーからログアウトします。よろしいですか？',
			detail:
				'ログアウトすると、ウィンドウがリロードされ、認証画面が表示されます。',
			cancelId: 0,
		},
		response => {
			if (response) {
				config.set('calendar.selected', '');
				config.set('credentials.token', '');
				TOKEN = '';
				settingWindow.hide();
				mainWindow.reload();
			}
		}
	);
});

ipcMain.on('applySchedule', (event, obj) => {
	let summary = config.get('summary.mentoring');
	if (!summary) {
		config.set('summary.mentoring', 'メンタリング %name %courseid%week');
	}
	let test = nf.scheduleMaker(obj);
	let title = nf.eventTitleMaker(obj, summary);
	let courseKey = obj.course.value;
	let name = obj.name.value;
	let week = obj.week.value;
	let startDate = nc.datePrep(obj.start.value);

	let resObj = {
		title: title,
		schedule: test,
		courseKey: courseKey,
		name: name,
		startDate: startDate,
		week: week,
	};
	event.returnValue = resObj;
});

ipcMain.on('addschedule', async (event, option) => {
	try {
		await loadingWindow.show();
		let content = await gg.getClientSecret();
		let tokenedAuth = await authorize(content);
		let res = await gg.addEvents(tokenedAuth, option);

		let courses = nc.courseReader();
		if (courses[option.data.courseKey].fixed) {
			await gg.addAllDayEvent(tokenedAuth, option);
		}

		res.sort((now, next) => {
			if (now.start.dateTime < next.start.dateTime) return -1;
			if (now.start.dateTime > next.start.dateTime) return 1;
			return 0;
		});
		event.returnValue = res;
		loadingWindow.hide();
	} catch (e) {
		console.error('Error loading client secret file: ' + e);
		console.error('addschedule');
		console.log(__dirname);
		return;
	}
});

ipcMain.on('getCalendarList', async event => {
	try {
		let content = await gg.getClientSecret();
		// authorize(content, gg.listCalendar, event);
		let tokenedAuth = await authorize(content);
		let res = await gg.listCalendar(tokenedAuth);
		event.returnValue = res;
	} catch (e) {
		console.error('Error loading client secret file: ' + e);
		console.error('getCalendarList');
		console.log(__dirname);
		return;
	}
});

ipcMain.on('getProfileData', async event => {
	try {
		let content = await gg.getClientSecret();
		// authorize(content, gg.userInfo, event);
		let tokenedAuth = await authorize(content);
		let res = await gg.userInfo(tokenedAuth, event);
		event.returnValue = res;
	} catch (e) {
		console.error('Error at ipc: getProfileData: ' + e);
		console.log(__dirname);
		return;
	}
});

ipcMain.on('changeCalendar', (event, calval) => {
	config.set('calendar.selected', calval);
});

ipcMain.on('getSelectedCalendar', event => {
	let data = config.get('calendar.selected');
	event.returnValue = data;
});

ipcMain.on('launchChecker', async event => {
	try {
		let content = await gg.getClientSecret();
		let res = await authorizeChecker(content);
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
		let credentials = await gg.getClientSecret();
		let oauth2Client = gg.OAuth2(credentials);

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

ipcMain.on('applyShiftData', async (event, obj) => {
	let year = parseInt(obj.year);
	let month = parseInt(obj.month);
	let calID = obj.calID;
	let title = config.get('summary.shift');
	let allShiftWDays = obj.allShiftWDays;
	let allShiftWDaysNum = [];
	let schedule = [];

	for (let i in allShiftWDays) {
		allShiftWDaysNum.push({
			wday: allShiftWDays[i].substr(3, 1),
			shift: allShiftWDays[i].substr(5, 1),
		});
	}

	let nextmonth = nc.paddingZero(month + 1);
	let nextdateStr = `${year}-${nextmonth}-01T00:00:00.000+09:00`;
	let nextdate = new Date(nextdateStr);
	let lastdate = new Date(nextdate.getTime() - 24 * 60 * 60 * 1000);
	let lastday = lastdate.getDate();

	for (let day = 1; day <= lastday; day++) {
		let tmpday = new Date(lastdate.setDate(day));
		let weekday = tmpday.getDay();
		for (let num in allShiftWDaysNum) {
			if (weekday == allShiftWDaysNum[num].wday) {
				let start;
				let end;
				if (allShiftWDaysNum[num].shift == 1) {
					start = new Date(tmpday.setHours(15));
					end = new Date(tmpday.setHours(19));
				} else {
					start = new Date(tmpday.setHours(19));
					end = new Date(tmpday.setHours(23));
				}
				schedule.push({ start, end });
			}
		}
	}
	let option = {
		calID: calID,
		data: {
			title: title,
			schedule: schedule,
		},
	};

	try {
		let content = await gg.getClientSecret();
		let tokenedAuth = await authorize(content);
		let res = await gg.addEvents(tokenedAuth, option);
		res.sort((now, next) => {
			if (now.start.dateTime < next.start.dateTime) return -1;
			if (now.start.dateTime > next.start.dateTime) return 1;
			return 0;
		});
		console.log(res);
		event.returnValue = res;
	} catch (e) {
		console.error('Error loading client secret file: ' + e);
		console.error('addschedule');
		console.log(__dirname);
		return;
	}
});

ipcMain.on('getShiftConf', (event, id) => {
	let data = config.get(`shift.${id}`);
	if (!data) {
		data = false;
	}
	event.returnValue = data;
});

ipcMain.on('shiftRemember', (event, { selector, value }) => {
	config.set(`shift.${selector}`, value);
	event.returnValue = 0;
});

ipcMain.on('courseGetter', event => {
	let promise = [];
	let course = nc.courseReader();
	let res = {};

	for (let key in course) {
		promise.push(
			new Promise((resolve, reject) => {
				try {
					let flag = config.get(`course.${key}`);
					if (typeof flag === 'undefined') {
						config.set(`course.${key}`, true);
						flag = true;
					}
					if (flag) {
						res[key] = course[key];
					}
					resolve();
				} catch (e) {
					reject(e);
				}
			})
		);
	}
	Promise.all(promise).then(() => {
		event.returnValue = res;
	});
});

ipcMain.on('courseList', event => {
	let course = nc.courseReader();
	event.returnValue = course;
});

ipcMain.on('courseRemember', (event, { selector, value }) => {
	config.set(`course.${selector}`, value);
	event.returnValue = 0;
});

ipcMain.on('getCourseConf', (event, id) => {
	let data = config.get(`course.${id}`);
	if (!data) {
		data = false;
	}
	event.returnValue = data;
});

ipcMain.on('applyChatSummary', (event, summary) => {
	try {
		config.set('summary.shift', summary);
		event.returnValue = true;
	} catch (e) {
		console.log('Error at applyChatSummary: ' + e);
		event.returnValue = false;
	}
});

ipcMain.on('getChatSummary', event => {
	try {
		let summary = config.get('summary.shift');
		event.returnValue = summary;
	} catch (e) {
		console.log('Error at getChatSummary: ' + e);
		event.returnValue = false;
	}
});

ipcMain.on('applyMentoringSummary', (event, summary) => {
	try {
		config.set('summary.mentoring', summary);
		event.returnValue = true;
	} catch (e) {
		console.log('Error at applyMentoringSummary: ' + e);
		event.returnValue = false;
	}
});

ipcMain.on('getMentoringSummary', event => {
	try {
		let summary = config.get('summary.mentoring');
		event.returnValue = summary;
	} catch (e) {
		console.log('Error at getMentoringSummary: ' + e);
		event.returnValue = false;
	}
});

ipcMain.on('openSettings', event => {
	settingWindow.show();
	event.returnValue = true;
});

ipcMain.on('closeSettings', event => {
	settingWindow.hide();
	mainWindow.reload();
	event.returnValue = true;
});

/**
 * TOKENがあるかどうかをチェック
 *
 * @param {Object} credentials The authorization client credentials.
 * @return {String}     OK / auth認証用のURL のいずれか
 */
function authorizeChecker(credentials) {
	let res;
	// Check if we have previously stored a token.
	if (TOKEN === '') {
		let oauth2Client = gg.OAuth2(credentials);
		let authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES,
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
function authorize(credentials) {
	let oauth2Client = gg.OAuth2(credentials);

	if (TOKEN === '') {
		let authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES,
		});
		shell.openExternal(authUrl);
	} else {
		oauth2Client.credentials = TOKEN;
		return oauth2Client;
	}
}
