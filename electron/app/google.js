'use strict';
/*eslint no-console: ["error", { allow: ["warn", "log", "dir", "error", "trace"] }] */

const fs = require('fs');
// pathモジュール
const path = require('path');
// GoogleCalendar
const { google } = require('googleapis');

// nodeFunc.js
const nc = require('./nodeCommon.js');

// clent_secret.jsonを読み込んで返す
exports.getClientSecret = () =>
	JSON.parse(fs.readFileSync(path.join(__dirname, '../client_secret.json')));

exports.OAuth2 = credentials => {
	let clientSecret = credentials.installed.client_secret;
	let clientId = credentials.installed.client_id;
	let redirectUrl = credentials.installed.redirect_uris[0];
	let oauth2Client = new google.auth.OAuth2(
		clientId,
		clientSecret,
		redirectUrl
	);

	return oauth2Client;
};

/**
 * func addEvents / グーグルカレンダーにイベントを登録
 *
 * @param {google.auth.OAuth2} auth : An authorized OAuth2 client.
 * @param {Object} option : スケジュール登録する内容
 *									option.calID : カレンダーID
 *									option.data.title : summary
 *									option.data.schedule[] : start / end
 */
exports.addEvents = (auth, option) => {
	let calendar = google.calendar('v3');

	let schedule = option.data.schedule;
	let title = option.data.title;
	let calID = option.calID;
	let promise = [];

	for (let i in schedule) {
		promise.push(
			new Promise((resolve, reject) => {
				let eventData = {
					summary: title,
					start: {
						dateTime: schedule[i].start,
					},
					end: {
						dateTime: schedule[i].end,
					},
				};

				let apiObj = {
					auth: auth,
					calendarId: calID,
					resource: eventData,
				};

				calendar.events.insert(apiObj, function(err, event) {
					if (err) {
						console.log(
							'There was an error contacting the Calendar service: ' + err
						);
						reject(err);
					}
					console.log(
						`Event created: ${event.data.summary} ${event.data.start.dateTime}`
					);
					resolve(event.data);
				});
			})
		);
	}

	let result = Promise.all(promise)
		.then(res => {
			return res;
		})
		.catch(err => {
			console.trace(err);
		});
	return result;
};

/**
 * func addAllDayEvent / グーグルカレンダーに終日イベントを登録
 *
 * @param {google.auth.OAuth2} auth : An authorized OAuth2 client.
 * @param {Object} option : スケジュール登録する内容
 *									option.calID : カレンダーID
 *									option.data.salaryTitle : 予定のタイトル
 *									option.data.week : 受講期間
 *									option.data.startDate : 初日
 */
exports.addAllDayEvent = (auth, option) => {
	let calendar = google.calendar('v3');
	let startDate = new Date(option.data.startDate);
	let tmpDate = startDate - 24 * 60 * 60 * 1000;
	let title = option.data.salaryTitle;
	let calID = option.calID;
	let count = option.data.week / 4;
	let promise = [];
	console.log(option.data.week);

	while (count > 0) {
		promise.push(
			new Promise((resolve, reject) => {
				tmpDate = tmpDate + 28 * 24 * 60 * 60 * 1000;
				let eventData = {
					summary: title,
					start: {
						date: nc.addAllDayEventDateFormatter(tmpDate),
					},
					end: {
						date: nc.addAllDayEventDateFormatter(tmpDate),
					},
				};

				let apiObj = {
					auth: auth,
					calendarId: calID,
					resource: eventData,
				};

				calendar.events.insert(apiObj, function(err, event) {
					if (err) {
						console.log(
							'There was an error contacting the Calendar service: ' + err
						);
						reject(err);
					}
					console.log(
						`Event created: ${event.data.summary} ${event.data.start.date}`
					);
					resolve(event.data);
				});
			})
		);
		count--;
	}

	let result = Promise.all(promise)
		.then(res => {
			return res;
		})
		.catch(err => {
			console.trace(err);
		});
	return result;
};

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth : An authorized OAuth2 client.
 * @param {Event} event : リターンさせたいイベント
 */
exports.listCalendar = auth => {
	let calendar = google.calendar('v3');
	let apiObj = { auth: auth };
	return new Promise(async (resolve, reject) => {
		calendar.calendarList.list(apiObj, (err, list) => {
			if (err) {
				console.log(
					'There was an error contacting the Calendar service at listCalendar: ' +
						err
				);
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
exports.userInfo = auth => {
	let profApi = google.oauth2('v2');
	let apiObj = { auth: auth };
	return new Promise(async (resolve, reject) => {
		profApi.userinfo.v2.me.get(apiObj, (err, prof) => {
			if (err) {
				console.log(
					'There was an error contacting the Profile service: ' + err
				);
				reject(err);
			}
			resolve(prof.data);
		});
	});
};
