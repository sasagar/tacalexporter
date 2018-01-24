'use strict';
const fs = require('fs');

function funcInterval (val1, val2) {
	// 未来の曜日を手前に。（そこまでの日数）
	var res;
	val1 = parseInt(val1);
	val2 = parseInt(val2);
	if (val2 > val1) {
		res = (val1 + 7) - val2;
	} else {
		res = val1 - val2;
	}
	return res;
}

const findTimes = function (week, course, addon = false) {
	var courseObj = JSON.parse(fs.readFileSync('course.json', 'utf8'));
	// 回数の計算
	// addonがtrueで来たら必ずperWeekは2。
	// addonがfalseで、perWeekが1だったら削らない
	// addonがfalseで、perWeekが2だったら1削る
	// セットの時の処理は、生成時のループで処理
	var times = 0;

	if (addon) {
		times = week * 2;
	} else {
		if (courseObj[course].perWeek === 1) {
			times = week * courseObj[course].perWeek;
		} else {
			times = week * courseObj[course].perWeek - 1;
		}
	}
	return times;
};

const datePrep = function (dateStr, timeStr = '00:00') {
	// yyyy年mm月dd日形式の物をdateに変換
	var year = dateStr.substr(0, 4);
	var month = dateStr.substr(5, 2);
	var day = dateStr.substr(8, 2);

	var date = new Date(year + '-' + month + '-' + day + 'T' + timeStr + ':00+09:00');

	return date;
};

const scheduleMaker = function (obj) {
	var array = [];
	var courseObj = JSON.parse(fs.readFileSync('course.json', 'utf8'));
	var courseKey = obj.course.value;
	var perWeek = parseInt(courseObj[courseKey].perWeek);
	var interval1 = 0;
	var interval2 = 0;
	var interval3 = 0;

	// 時間を調整
	obj.firstTime = {value: obj.firstHour.value + ':' + obj.firstMinutes.value};
	obj.secondTime = {value: obj.secondHour.value + ':' + obj.secondMinutes.value};

	// 初回
	var startDate = datePrep(obj.start.value);
	var startWDay = startDate.getDay();
	// スタート日と初回の日数差を出す。
	interval1 = funcInterval(obj.first.value, startWDay);

	var firstStart = new Date(startDate.getTime() + (interval1 * 24 * 60 * 60 * 1000));
	firstStart.setHours(obj.firstTime.value.substr(0, 2));
	firstStart.setMinutes(obj.firstTime.value.substr(3, 2));
	var firstEnd = new Date(firstStart.getTime() + (30 * 60 * 1000));
	var first = {
		start: firstStart,
		end: firstEnd
	};
	array.push(first);

	if (perWeek === 1) {
		interval2 = 7;
		interval3 = 7;
	} else {
		// 初回と二回目の日数差を出す。
		interval2 = funcInterval(obj.second.value, obj.first.value);

		var secondStart = new Date(firstStart.getTime() + (interval2 * 24 * 60 * 60 * 1000));
		secondStart.setHours(obj.secondTime.value.substr(0, 2));
		secondStart.setMinutes(obj.secondTime.value.substr(3, 2));
		var secondEnd = new Date(secondStart.getTime() + (30 * 60 * 1000));
		var second = {
			start: secondStart,
			end: secondEnd
		};
		array.push(second);

		// 残りはループで処理
		// 二回目と一回目の間の日数をinterval3とする
		interval3 = funcInterval(obj.first.value, obj.second.value);

		var addon = false;
		if (obj.extra) {
			addon = true;
		}
	}

	var times = findTimes(obj.week.value, courseKey, addon);

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
		var dayEnd = new Date(dayStart.getTime() + (30 * 60 * 1000));
		var day = {
			start: dayStart,
			end: dayEnd
		};
		array.push(day);
	}
	// セットだったら真ん中削る
	if (courseObj[obj.course.value].set) {
		array.splice((times - 1) / 2, 1);
	}
	return array;
};

const eventTitleMaker = function (obj) {
	var name = obj.name.value;
	var course = obj.course.value;
	var week = ('00' + obj.week.value).slice(-2);

	var title = 'メンタリング ' + name + ' ' + course + week;

	return title;
};

module.exports = {
	findTimes: findTimes,
	datePrep: datePrep,
	scheduleMaker: scheduleMaker,
	eventTitleMaker: eventTitleMaker
};
