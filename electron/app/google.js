'use strict';
/*eslint no-console: ["error", { allow: ["warn", "log", "dir", "error"] }] */

const fs = require('fs');
// pathモジュール
const path = require('path');
// google OAuth2ライブラリ
const {OAuth2Client} = require('google-auth-library');
// GoogleCalendar
const google = require('googleapis');


// clent_secret.jsonを読み込んで返す
exports.getClientSecret = () => JSON.parse(fs.readFileSync(path.join(__dirname, '../client_secret.json')));

exports.OAuth2 = (credentials) => {
	var clientSecret = credentials.installed.client_secret;
	var clientId = credentials.installed.client_id;
	var redirectUrl = credentials.installed.redirect_uris[0];
	var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

	return oauth2Client;
};

/**
 * func addEvents / グーグルカレンダーにカレンダーを登録
 *
 * @param {google.auth.OAuth2} auth : An authorized OAuth2 client.
 * @param {Object} option : スケジュール登録する内容
 *									option.calID : カレンダーID
 *									option.data.title : summary
 *									option.data.schedule[] : start / end
 */
exports.addEvents = (auth, option) => {
	var calendar = google.calendar('v3');

	var schedule = option.data.schedule;
	var title = option.data.title;
	var calID = option.calID;
	var promise = [];

	for (var i in schedule) {
		promise.push(
			new Promise ((resolve, reject) => {
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
						reject(err);
					}
					console.log(`Event created: ${event.data.summary} ${event.data.start.dateTime}`);
					resolve(event.data);
				});
			})
		);
	}

	var result = Promise.all(promise)
		.then((res) => {
			return res;
		});
	return result;
};

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth : An authorized OAuth2 client.
 * @param {Event} event : リターンさせたいイベント
 */
exports.listCalendar = (auth) => {
	var calendar = google.calendar('v3');
	var apiObj = {'auth': auth};
	return new Promise (async (resolve, reject) => {
		calendar.calendarList.list(apiObj, (err, list) => {
			if (err) {
				console.log('There was an error contacting the Calendar service at listCalendar: ' + err);
				reject(err);
			}
			resolve(list.data.items);
		});
	});
};

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
exports.userInfo = (auth) => {
	var profApi = google.oauth2('v2');
	var apiObj = {'auth': auth};
	return new Promise (async (resolve, reject) => {
		profApi.userinfo.v2.me.get(apiObj, (err, prof) => {
			if (err) {
				console.log('There was an error contacting the Profile service: ' + err);
				reject(err);
			}
			resolve(prof.data);
		});
	});
};
