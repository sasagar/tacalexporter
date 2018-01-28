'use strict';
const fs = require('fs');
const path = require('path');

/**
 * 2つの曜日の間隔を日数で返す
 * @param  {Number} val1 何曜日までかを数値で（日曜：0）
 * @param  {Number} val2 何曜日からかを数値で（日曜：0）
 * @return {Number}      日数
 */
exports.funcInterval = (val1, val2) => {
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
};

/**
 * 回数割り出し
 * @param  {Number}  week          何週間プランか
 * @param  {String}  course        コースの2文字キー
 * @param  {Boolean} [addon=false] 追加プランの有無
 * @return {Number}                メンタリングの回数
 */
exports.findTimes = (week, course, addon = false) => {
	var courseObj = this.courseReader();
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
/**
 * yyyy年mm月dd日形式の物をdateに変換
 * @param  {String} dateStr           日付の文字列 yyyy年mm月dd日
 * @param  {String} [timeStr='00:00'] 時間の文字列 HH:MM
 * @return {Date}                   Dateに変換された物
 */
exports.datePrep = (dateStr, timeStr = '00:00') => {
	var year = dateStr.substr(0, 4);
	var month = dateStr.substr(5, 2);
	var day = dateStr.substr(8, 2);

	var date = new Date(year + '-' + month + '-' + day + 'T' + timeStr + ':00+09:00');

	return date;
};

/**
 * 2桁の0埋めをする
 * @param  {number} int int型の数値
 * @return {string}     0埋めされた二桁の数字を文字列にしたもの
 */
exports.paddingZero = (int) => String(int).padStart(2, '0');

exports.courseReader = () => {
	var res = JSON.parse(fs.readFileSync(path.join(__dirname, '../course.json'), 'utf8'));
	return res;
};
