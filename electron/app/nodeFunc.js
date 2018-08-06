'use strict';
const fs = require('fs');
// pathモジュール
const path = require('path');

const nc = require('./nodeCommon');

/**
 * 登録したいスケジュールの一覧を作る
 * @param  {Object} obj フォームデータを取得したオブジェクト
 * @return {Array}     日程の配列{start, end}形式
 */
exports.scheduleMaker = obj => {
	let courseObj = JSON.parse(
		fs.readFileSync(path.join(__dirname, '../course.json'), 'utf8')
	);
	let courseKey = obj.course.value;
	let perWeek = parseInt(courseObj[courseKey].perWeek);
	let res;

	// 週一コースで追加サポートで無いならインターバルは無条件で7
	// それ以外はインターバル計算する
	if (perWeek === 1 && !obj.extra) {
		res = onceScheduleMaker(obj, courseObj, courseKey, perWeek);
	} else {
		res = twiceScheduleMaker(obj, courseObj, courseKey, perWeek);
	}

	return res;
};

const onceScheduleMaker = (obj, courseObj, courseKey, perWeek) => {
	let array = [];
	let interval1 = 0;
	let interval2 = 0;
	let interval3 = 0;

	// 時間を調整
	obj.firstTime = { value: obj.firstHour.value + ':' + obj.firstMinutes.value };
	obj.secondTime = {
		value: obj.secondHour.value + ':' + obj.secondMinutes.value,
	};

	// 初回
	let startDate = nc.datePrep(obj.start.value);
	let startWDay = startDate.getDay();
	// スタート日と初回の日数差を出す。
	interval1 = nc.funcInterval(obj.first.value, startWDay);
	// スタートとエンドを割り出す
	let first = startEndMaker(startDate, obj.firstTime.value, interval1);
	// 配列に突っ込む
	array.push(first);

	// インターバル計算する
	// 初回と二回目の日数差を出す。
	interval2 = nc.funcInterval(obj.second.value, startWDay) + 7 - interval1;
	// スタートとエンドを割り出す
	let second = startEndMaker(first.start, obj.secondTime.value, interval2);
	// 年末年始かチェックして、期間内なら一週間すっ飛ばし
	if (checkHolidays(second)) {
		second.start.setDate(second.start.getDate() + 7);
		second.end.setDate(second.end.getDate() + 7);
	}
	// 配列に突っ込む
	array.push(second);

	// 残りはループで処理するので、インターバルを計算
	// 週1なので無条件に7日
	interval3 = 7;

	let addon = false;
	if (obj.extra) {
		addon = true;
	}

	let times = nc.findTimes(obj.week.value, courseKey, addon);

	for (let i = perWeek + 1; i < times; i++) {
		let interval = 0;
		let hour = 0;
		let min = 0;

		if (i === 1) {
			hour = obj.firstTime.value.substr(0, 2);
			min = obj.firstTime.value.substr(3, 2);
		} else {
			hour = obj.secondTime.value.substr(0, 2);
			min = obj.secondTime.value.substr(3, 2);
		}

		interval = interval3;

		let last = array[i - 1].start;
		let msecInverval = interval * 24 * 60 * 60 * 1000;
		let dayStart = new Date(last.getTime() + msecInverval);
		dayStart.setHours(hour);
		dayStart.setMinutes(min);
		let dayEnd = new Date(dayStart.getTime() + 30 * 60 * 1000);
		let day = {
			start: dayStart,
			end: dayEnd,
		};
		// 年末年始かチェックして、期間内なら一週間すっ飛ばし
		if (checkHolidays(day)) {
			day.start.setDate(day.start.getDate() + 7);
			day.end.setDate(day.end.getDate() + 7);
		}
		array.push(day);
	}
	// セットだったら真ん中削る
	// キーが2文字ずつなので、2で割ってセットの数を計算
	if (courseObj[obj.course.value].set && obj.course.value.length / 2 === 2) {
		array.splice((times - 1) / 2, 1);
	} else if (
		courseObj[obj.course.value].set &&
		obj.course.value.length / 2 === 3
	) {
		let rmTimes = (times + 1) / 3 - 1;
		array.splice(rmTimes, 1);
		array.splice(rmTimes * 2, 1);
	}
	return array;
};

const twiceScheduleMaker = (obj, courseObj, courseKey, perWeek) => {
	let array = [];
	let interval1 = 0;
	let interval2 = 0;
	let interval3 = 0;

	// 時間を調整
	obj.firstTime = { value: obj.firstHour.value + ':' + obj.firstMinutes.value };
	obj.secondTime = {
		value: obj.secondHour.value + ':' + obj.secondMinutes.value,
	};

	// 初回
	let startDate = nc.datePrep(obj.start.value);
	let startWDay = startDate.getDay();
	// スタート日と初回の日数差を出す。
	interval1 = nc.funcInterval(obj.first.value, startWDay);
	// スタートとエンドを割り出す
	let first = startEndMaker(startDate, obj.firstTime.value, interval1);
	// 配列に突っ込む
	array.push(first);

	// インターバル計算する
	// 初回と二回目の日数差を出す。
	interval2 = nc.funcInterval(obj.second.value, obj.first.value);
	// スタートとエンドを割り出す
	let second = startEndMaker(first.start, obj.secondTime.value, interval2);
	// 年末年始かチェックして、期間内なら一週間すっ飛ばし
	if (checkHolidays(second)) {
		second.start.setDate(second.start.getDate() + 7);
		second.end.setDate(second.end.getDate() + 7);
	}
	// 配列に突っ込む
	array.push(second);

	// 残りはループで処理するので、インターバルを計算
	// 二回目と一回目の間の日数をinterval3とする
	interval3 = nc.funcInterval(obj.first.value, obj.second.value);

	let addon = false;
	if (obj.extra) {
		addon = true;
	}

	let times = nc.findTimes(obj.week.value, courseKey, addon);

	for (let i = perWeek; i < times; i++) {
		let interval = 0;
		let hour = 0;
		let min = 0;

		if (i % 2 === 0) {
			interval = interval3;
			hour = obj.firstTime.value.substr(0, 2);
			min = obj.firstTime.value.substr(3, 2);
		} else {
			interval = interval2;
			hour = obj.secondTime.value.substr(0, 2);
			min = obj.secondTime.value.substr(3, 2);
		}

		let last = array[i - 1].start;
		let msecInverval = interval * 24 * 60 * 60 * 1000;
		let dayStart = new Date(last.getTime() + msecInverval);
		dayStart.setHours(hour);
		dayStart.setMinutes(min);
		let dayEnd = new Date(dayStart.getTime() + 30 * 60 * 1000);
		let day = {
			start: dayStart,
			end: dayEnd,
		};
		// 年末年始かチェックして、期間内なら一週間すっ飛ばし
		if (checkHolidays(day)) {
			day.start.setDate(day.start.getDate() + 7);
			day.end.setDate(day.end.getDate() + 7);
		}
		array.push(day);
	}
	// セットだったら真ん中削る
	// キーが2文字ずつなので、2で割ってセットの数を計算
	if (courseObj[obj.course.value].set && obj.course.value.length / 2 === 2) {
		array.splice((times - 1) / 2, 1);
	} else if (
		courseObj[obj.course.value].set &&
		obj.course.value.length / 2 === 3
	) {
		let rmTimes = (times + 1) / 3 - 1;
		array.splice(rmTimes, 1);
		array.splice(rmTimes * 2, 1);
	}
	return array;
};

/**
 * 予定のスタートとエンドを計算する
 * @param  {String} estDate     基準となる日付の文字列（Date型では無い）
 * @param  {String} targetDate  開始日の文字列
 * @param  {Number} intervalDay 日数差
 * @return {Object}             startとendのDateが入ったオブジェクト
 */
const startEndMaker = (estDate, targetDate, intervalDay) => {
	let start = new Date(estDate.getTime() + intervalDay * 24 * 60 * 60 * 1000);
	start.setHours(targetDate.substr(0, 2));
	start.setMinutes(targetDate.substr(3, 2));
	let end = new Date(start.getTime() + 30 * 60 * 1000);
	let res = { start, end };
	return res;
};

/**
 * 予定が年末年始か判断する
 * @param  {Date} estDate       基準となる日付のオブジェクト（start, endの形式）startEndMakerの結果を利用（Date型）
 * @return {Boolean}            年末年始ならtrue/それ以外はfalse
 */
const checkHolidays = estDate => {
	let res = false;
	const month = estDate.start.getMonth() + 1;
	const date = estDate.start.getDate();
	console.log('month:' + month);
	console.log('date:' + date);
	if ((month == 12 && date >= 28) || (month == 1 && date <= 3)) {
		res = true;
		console.log('test');
	}
	return res;
};

/**
 * [exports] 登録したいイベントのタイトルをつくる
 * @param  {Object} obj     name, course, weekの3つのvalue
 * @param  {String} summary 設定のテンプレート文字列
 * @return {String}         イベントタイトル
 */
exports.eventTitleMaker = (obj, summary) => {
	let courses = nc.courseReader();
	let name = obj.name.value;
	let course = obj.course.value;
	let courseFullName = courses[course].fullname;
	let week = obj.week.value.padStart(2, '0');

	let title = summary
		.replace(/%name/g, name)
		.replace(/%courseid/g, course)
		.replace(/%course/g, courseFullName)
		.replace(/%week/g, week);

	return title;
};
