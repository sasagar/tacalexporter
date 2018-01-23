'use strict';
const {ipcRenderer} = require('electron');
const fs = require('fs');

// electron によりhtmlが描画されてから実行
$(document).ready(function () {
	// Default
	$('.datepicker .date').datepicker({
		format: 'yyyy年mm月dd日',
		language: 'ja'
	});

	var course = JSON.parse(fs.readFileSync('course.json', 'utf8'));
	$('#course').empty();
	for (var i in course) {
		$('#course').append('<option value="' + course[i].key + '" data-fullname="' + course[i].fullname + '">' + course[i].fullname + '</option>');
	}

	$('#dataapply').on('click', function () {
		var form = $('#schedule');
		var formArr = form.serializeArray();
		var formObj = {};
		for (var obj of formArr) {
			var name = obj.name;
			delete obj.name;
			formObj[name] = obj;
		}
		var response = ipcRenderer.sendSync('applySchedule', formObj);

		var title = response.title;
		var schedule = response.schedule;

		$('#tablebody').empty();
		var weekday = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'];

		for (var i in schedule) {
			var tmpStart = new Date(schedule[i].start);
			var tmpEnd = new Date(schedule[i].end);
			var date = tmpStart.getFullYear() + '/' + ('00' + (tmpStart.getMonth() + 1)).slice(-2) + '/' + ('00' + tmpStart.getDate()).slice(-2);
			var wDay = tmpStart.getDay()
			var hour = ('00' + tmpStart.getHours()).slice(-2);
			var minute = ('00' + tmpStart.getMinutes()).slice(-2);
			var hourEnd = ('00' + tmpEnd.getHours()).slice(-2);
			var minuteEnd = ('00' + tmpEnd.getMinutes()).slice(-2);
			var num = i * 1 + 1;
			$('#tablebody').append('<tr><th scope="row">' + num + '</th><td>' + title + '</td><td>' + date + '</td><td>' + weekday[wDay] + '</td><td>' + hour + ':' + minute + '</td><td>' + hourEnd + ':' + minuteEnd + '</td></tr>');
		}

		$('#data').val(JSON.stringify(response));
		console.log($('#data').val());
	});

	$('#applydata').on('click', function () {
		var data = $('#data').val();
		var schedule = JSON.parse(data);
		var response = ipcRenderer.sendSync('addschedule', schedule);
		// console.log(response);
	});
});
