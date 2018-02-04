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
export const scheduleMaker = obj => {
	var array = [];
	var courseObj = JSON.parse(
		fs.readFileSync(path.join(__dirname, '../course.json'), 'utf8')
	);
	var courseKey = obj.course.value;
	var perWeek = parseInt(courseObj[courseKey].perWeek);
	var interval1 = 0;
	var interval2 = 0;
	var interval3 = 0;

	// 時間を調整
	obj.firstTime = { value: obj.firstHour.value + ':' + obj.firstMinutes.value };
	obj.secondTime = {
		value: obj.secondHour.value + ':' + obj.secondMinutes.value,
	};

	// 初回
	var startDate = nc.datePrep(obj.start.value);
	var startWDay = startDate.getDay();
	// スタート日と初回の日数差を出す。
	interval1 = nc.funcInterval(obj.first.value, startWDay);
	// スタートとエンドを割り出す
	var first = startEndMaker(startDate, obj.firstTime.value, interval1);
	// 配列に突っ込む
	array.push(first);

	// 週一コースで追加サポートで無いならインターバルは無条件で7
	// それ以外はインターバル計算する
	if (perWeek === 1 && !obj.extra) {
		interval2 = 7;
		interval3 = 7;
	} else {
		// 初回と二回目の日数差を出す。
		interval2 = nc.funcInterval(obj.second.value, obj.first.value);
		// スタートとエンドを割り出す
		var second = startEndMaker(first.start, obj.secondTime.value, interval2);
		// 配列に突っ込む
		array.push(second);

		// 残りはループで処理するので、インターバルを計算
		// 二回目と一回目の間の日数をinterval3とする
		interval3 = nc.funcInterval(obj.first.value, obj.second.value);

		var addon = false;
		if (obj.extra) {
			addon = true;
		}
	}

	var times = nc.findTimes(obj.week.value, courseKey, addon);

	for (var i = perWeek; i < times; i++) {
		var interval = 0;
		var hour = 0;
		var min = 0;

		if (i % 2 === 0) {
			interval = interval3;
			hour = obj.firstTime.value.substr(0, 2);
			min = obj.firstTime.value.substr(3, 2);
		} else {
			interval = interval2;
			hour = obj.secondTime.value.substr(0, 2);
			min = obj.secondTime.value.substr(3, 2);
		}

		var last = array[i - 1].start;
		var msecInverval = interval * 24 * 60 * 60 * 1000;
		var dayStart = new Date(last.getTime() + msecInverval);
		dayStart.setHours(hour);
		dayStart.setMinutes(min);
		var dayEnd = new Date(dayStart.getTime() + 30 * 60 * 1000);
		var day = {
			start: dayStart,
			end: dayEnd,
		};
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
		var rmTimes = (times + 1) / 3 - 1;
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
	var start = new Date(estDate.getTime() + intervalDay * 24 * 60 * 60 * 1000);
	start.setHours(targetDate.substr(0, 2));
	start.setMinutes(targetDate.substr(3, 2));
	var end = new Date(start.getTime() + 30 * 60 * 1000);
	var res = { start, end };
	return res;
};

/**
 * [exports] 登録したいイベントのタイトルをつくる
 * @param  {Object} obj     name, course, weekの3つのvalue
 * @param  {String} summary 設定のテンプレート文字列
 * @return {String}         イベントタイトル
 */
export const eventTitleMaker = (obj, summary) => {
	var courses = nc.courseReader();
	var name = obj.name.value;
	var course = obj.course.value;
	var courseFullName = courses[course].fullname;
	var week = obj.week.value.padStart(2, '0');

	var title = summary
		.replace(/%name/g, name)
		.replace(/%courseid/g, course)
		.replace(/%course/g, courseFullName)
		.replace(/%week/g, week);

	return title;
};
