'use strict';
const {ipcRenderer} = require('electron');
const fs = require('fs');
// pathモジュール
const path = require('path');

// electron によりhtmlが描画されてから実行
$(document).ready(function () {
	// Default
	$('.datepicker .date').datepicker({
		format: 'yyyy年mm月dd日',
		language: 'ja'
	});

	var course = JSON.parse(fs.readFileSync(path.join(__dirname, 'course.json'), 'utf8'));
	$('#course').empty();
	for (var i in course) {
		$('#course').append('<option value="' + course[i].key + '" data-fullname="' + course[i].fullname + '" data-perweek="' + course[i].perWeek + '">' + course[i].fullname + '</option>');
	}

	$('#dataapply').on('click', function () {
		$('#dataapply').prop('disabled', true);
		$('#dataapply i').css('display', 'inline');
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
			var wDay = tmpStart.getDay();
			var hour = ('00' + tmpStart.getHours()).slice(-2);
			var minute = ('00' + tmpStart.getMinutes()).slice(-2);
			var hourEnd = ('00' + tmpEnd.getHours()).slice(-2);
			var minuteEnd = ('00' + tmpEnd.getMinutes()).slice(-2);
			var num = i * 1 + 1;
			$('#tablebody').append('<tr><th scope="row">' + num + '</th><td>' + title + '</td><td>' + date + '</td><td>' + weekday[wDay] + '</td><td>' + hour + ':' + minute + '</td><td>' + hourEnd + ':' + minuteEnd + '</td></tr>');
		}

		$('#data').val(JSON.stringify(response));
		// console.log($('#data').val());
		$('#dataapply i').css('display', 'none');
		$('#dataapply').prop('disabled', false);
		$('#applydata').prop('disabled', false);
	});

	$('#applydata').on('click', function () {
		var data = $('#data').val();
		var calID = $('#calendar').val();
		var schedule = JSON.parse(data);
		var obj = {calID: calID, data: schedule};
		$('#modalMessage').empty();
		ipcRenderer.send('addschedule', obj);
		$('#applydata').prop('disabled', true);
		$('#modal').modal();
	});

	var flag = launchChecker();
	if (flag) {
		selectChecker();
		listGetter();
		selectCalendar();
		profileSetter();
	}

	$('#code').keypress(function (e) {
		if (e.which === 13) {
			// ここに処理を記述
			tokenSubmitter();
		}
	});

	ipcRenderer.on('resultMessage', function (event, args) {
		var title = args.summary;
		var start = new Date(args.start.dateTime);
		var startYear = start.getFullYear();
		var startMonth = start.getMonth() + 1;
		startMonth = ('00' + startMonth).slice(-2);
		var startDate = ('00' + start.getDate()).slice(-2);
		var startHours = ('00' + start.getHours()).slice(-2);
		var startMinutes = ('00' + start.getMinutes()).slice(-2);
		$('#modalMessage').append('<p>' + title + ' @ ' + startYear + '/' + startMonth + '/' + startDate + ' ' + startHours + ':' + startMinutes + '</p>');
	});
});

function selectChecker () {
	var perWeek = parseInt($('#course option:selected').attr('data-perweek'));

	if (perWeek === 1) {
		$('#secondDiv').hide();
	} else {
		$('#secondDiv').show();
	}
}

function checkChecker () {
	var check = $('#extra').prop('checked');

	if (check) {
		$('#secondDiv').show();
	} else {
		$('#secondDiv').hide();
	}
}

function listGetter () {
	var list = ipcRenderer.sendSync('getCalendarList');

	for (var i in list) {
		var data = list[i];
		if (data.accessRole === 'write' || data.accessRole === 'owner') {
			$('#calendar').append('<option value="' + data.id + '">' + data.summary + '</option>');
		}
	}
}

function calendarChange () {
	var data = $('#calendar').val();
	ipcRenderer.send('changeCalendar', data);
}

function selectCalendar () {
	var val = ipcRenderer.sendSync('getSelectedCalendar');
	$('#calendar').val(val);
}

function launchChecker () {
	var res = ipcRenderer.sendSync('launchChecker');
	if (res.substr(0, 4) === 'http') {
		$('#tokenModal').modal();
		return false;
	}
	return true;
}

function tokenSubmitter () {
	var code = $('#code').val();
	var res = ipcRenderer.sendSync('tokenSubmit', code);
	if (res) {
		modalClose('#tokenModal');
		location.reload();
	}
}

function modalClose (selector) {
	$('body').removeClass('modal-open');
	$('.modal-backdrop').remove();
	$(selector).modal('hide');
}

function profileSetter () {
	var profile = ipcRenderer.sendSync('getProfileData');
	$('#familyName').text(profile.family_name);
	$('#givenName').text(profile.given_name);
	$('#iconImg').append('<img src="' + profile.picture + '" class="rounded-circle" style="max-width: 56px;">');
}
