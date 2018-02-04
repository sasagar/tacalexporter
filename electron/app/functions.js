'use strict';
/*eslint no-console: ["error", { allow: ["warn", "error"] }] */

import { ipcRenderer } from 'electron';

var weekday = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'];

// electron によりhtmlが描画されてから実行
$(document).ready(() => {
	launchChecker();

	// DatePicker
	$('.datepicker .date').datepicker({
		format: 'yyyy年mm月dd日',
		language: 'ja',
	});

	$('#dataapply').on('click', () => {
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

		for (var i in schedule) {
			var tmpStart = new Date(schedule[i].start);
			var tmpEnd = new Date(schedule[i].end);
			var date =
				tmpStart.getFullYear() +
				'/' +
				paddingZero(tmpStart.getMonth() + 1) +
				'/' +
				paddingZero(tmpStart.getDate());
			var wDay = tmpStart.getDay();
			var hour = paddingZero(tmpStart.getHours());
			var minute = paddingZero(tmpStart.getMinutes());
			var hourEnd = paddingZero(tmpEnd.getHours());
			var minuteEnd = paddingZero(tmpEnd.getMinutes());
			var num = i * 1 + 1;
			$('#tablebody').append(
				`<tr>
				<th scope="row">${num}</th>
				<td>${title}</td>
				<td>${date}</td>
				<td>${weekday[wDay]}</td>
				<td>${hour}:${minute}</td>
				<td>${hourEnd}:${minuteEnd}</td>
				</tr>`
			);
		}

		$('#data').val(JSON.stringify(response));
		$('#dataapply i').css('display', 'none');
		$('#dataapply').prop('disabled', false);
		$('#applydata').prop('disabled', false);
	});

	$('#applydata').on('click', () => applyData());

	$('#tokenSubmit').on('click', () => tokenSubmitter());

	$('#calendar').on('change', () => calendarChange());

	$('#course').on('change', () => selectChecker());

	$('#extra').on('change', () => selectChecker());

	$('.flagCheckbox').on('change', eo => shiftFlagChecker(eo));

	// どうやらモーダルで表示する物はそのページで拾った方が良いみたい。
	// $('.courseFlag').on('change', () => console.log('test'));

	$('#chatSummarySubmit').on('click', () => applyChatSummary());

	$('#mentoringSummarySubmit').on('click', () => applyMentoringSummary());

	$('#applyShiftData').on('click', () => applyShiftData());

	$('.settingicon').on('click', () => openSettings());

	$('.settingclose').on('click', () => closeSettings());

	$('#code').keypress(function(e) {
		// Enterで送信出来るように
		if (e.which === 13) {
			tokenSubmitter();
		}
	});

	$('#logoutBtn').on('click', () => {
		ipcRenderer.send('logout');
	});
});

const showLoading = async () => {
	await $.LoadingOverlay('show', {
		image: '',
		fontawesome: 'fa fa-spinner fa-spin',
	});
};

/**
 * コースのJSONファイルを読み込み、選択ボックスに流し込む
 */
const courseGetter = () => {
	var course = ipcRenderer.sendSync('courseGetter');
	$('#course').empty();
	for (var i in course) {
		$('#course').append(
			`<option value="${course[i].key}" data-fullname="${
				course[i].fullname
			}" data-perweek="${course[i].perWeek}">
			${course[i].fullname}
			</option>`
		);
	}
};

const courseSettingListing = () => {
	new Promise((resolve, reject) => {
		try {
			$('#settingTableBody').empty();
			var courses = ipcRenderer.sendSync('courseList');
			for (var key in courses) {
				$('#settingTableBody').append(
					`<tr>
						<td>
							<div class="btn-group-toggle" data-toggle="buttons">
								<label class="btn btn-info">
									<input type="checkbox" class="courseFlag" name="${key}" id="${key}">
									<span class="flagText"></span>
								</label>
							</div>
						</td>
						<td>
							${courses[key].fullname}
						</td>
					</tr>`
				);
			}
		} catch (e) {
			reject(e);
		}
	});
};

/**
 * [async] 起動時のチェックプロセス
 * 全ての処理が終わったら画面を表示する
 */
const launchChecker = async () => {
	await showLoading();
	var flag = true;
	var res = ipcRenderer.sendSync('launchChecker');
	if (res.substr(0, 4) === 'http') {
		$('#tokenModal').modal();
		$.LoadingOverlay('hide');
		flag = false;
	}
	if (flag) {
		await Promise.all([
			profileSetter(),
			courseGetter(),
			listGetter(),
			calendarSetter(),
			courseSettingListing(),
		]);
		await Promise.all([
			selectChecker(),
			selectCalendar(),
			shiftSetter(),
			settingsSetter(),
			setChatSummary(),
			setMentoringSummary(),
		]);
		$('.container').fadeIn(200);
		$.LoadingOverlay('hide');
	}
};

/**
 * メインプロセスに切っ掛けを送り、ユーザー情報を取得、htmlに流し込み
 * @return {Promise} await用のPromise
 */
const profileSetter = () => {
	new Promise((resolve, reject) => {
		try {
			var profile = ipcRenderer.sendSync('getProfileData');
			$('.familyName').text(profile.family_name);
			$('.givenName').text(profile.given_name);
			$('.iconImg').append(`
				<img src="${profile.picture}" class="rounded-circle" style="max-width: 56px;">`);
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};

/**
 * コースが変更される度に呼び出される
 * data-perweekの数字が1で、#extraのチェックが無い時に二回目の欄を隠す
 * それ以外の時に二回目の欄を表示する
 * @return {Promise} await用のPromise
 */
const selectChecker = () => {
	new Promise((resolve, reject) => {
		try {
			var perWeek = parseInt($('#course option:selected').attr('data-perweek'));
			var check = $('#extra').prop('checked');

			if (perWeek === 1 && !check) {
				$('#secondDiv').hide();
			} else {
				$('#secondDiv').show();
			}
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};

/**
 * メインプロセスで現在のユーザのカレンダーを取得し、#calendarのselect要素に追加する
 * @return {Promise} await用のPromise
 */
const listGetter = () => {
	new Promise((resolve, reject) => {
		try {
			var list = ipcRenderer.sendSync('getCalendarList');

			for (var i in list) {
				var data = list[i];
				if (data.accessRole === 'write' || data.accessRole === 'owner') {
					$('[name=calendar]').append(
						`<option value="${data.id}">${data.summary}</option>`
					);
				}
			}
		} catch (e) {
			reject(e);
		}
	});
};

const shiftSetter = () => {
	var shifts = $('.flagCheckbox');
	for (var shift of shifts) {
		var id = $(shift).attr('id');
		var res = ipcRenderer.sendSync('getShiftConf', id);
		if (res) {
			$(shift).prop('checked', true);
			$(shift)
				.next('.flagText')
				.html('シフト');
			$(shift)
				.parent()
				.addClass('active');
		}
	}
};

/**
 * 日付のリストをシフトのセレクトボックスに追加する
 * @return {Promise} await用のPromise
 */
const calendarSetter = () => {
	var now = new Date();
	var thisMonthTmp = new Date(now.setDate(1));
	var thisMonthFirstDay = new Date(thisMonthTmp);
	var nextMonthFirstDay = new Date(
		thisMonthTmp.setMonth(thisMonthTmp.getMonth() + 1)
	);
	var thisMonth = thisMonthFirstDay.getMonth() + 1;
	var nextMonth = nextMonthFirstDay.getMonth() + 1;
	var thisYear = thisMonthFirstDay.getFullYear();
	var nextYear = nextMonthFirstDay.getFullYear();
	new Promise((resolve, reject) => {
		try {
			if (thisYear !== nextYear) {
				$('#shiftYear').append(
					`<option value="${thisYear}">${thisYear}</option>`
				);
				$('#shiftYear').append(
					`<option value="${nextYear}" selected>${nextYear}</option>`
				);
			} else {
				$('#shiftYear').append(
					`<option value="${thisYear}">${thisYear}</option>`
				);
			}
			$('#shiftMonth').append(
				`<option value="${thisMonth}">${thisMonth}</option>`
			);
			$('#shiftMonth').append(
				`<option value="${nextMonth}" selected>${nextMonth}</option>`
			);
		} catch (e) {
			reject(e);
		}
	});
};

/**
 * メインプロセスから規定のカレンダーを取得し、選択状態にする
 * @return {Promise} await用のPromise
 */
const selectCalendar = () => {
	new Promise((resolve, reject) => {
		try {
			var val = ipcRenderer.sendSync('getSelectedCalendar');
			$('[name=calendar]').val(val);
		} catch (e) {
			reject(e);
		}
	});
};

const settingsSetter = () => {
	var courses = $('.courseFlag');
	for (var course of courses) {
		var id = $(course).attr('id');
		var res = ipcRenderer.sendSync('getCourseConf', id);
		if (res) {
			$(course).prop('checked', true);
			$(course)
				.next('.flagText')
				.html('オン');
			$(course)
				.parent()
				.addClass('active');
		} else {
			$(course)
				.next('.flagText')
				.html('オフ');
		}
	}
};

/**
 * #data のフォーム内容を取得してJSON形式に変換
 * カレンダーIDとスケジュールのオブジェクトにした上でスケジュールに登録し、
 * モーダルを表示
 */
const applyData = () => {
	$('#applydata i').css('display', 'inline');
	$('#modal').modal();
	$('#modalMessage').empty();
	$('#applydata').prop('disabled', true);
	var data = $('#data').val();
	var calID = $('#calendar').val();
	var schedule = JSON.parse(data);
	var obj = { calID: calID, data: schedule };
	var res = ipcRenderer.sendSync('addschedule', obj);
	resultMessage(res);
	$('#applydata i').css('display', 'none');
};

/**
 * 入力されたtokenをメインプロセスに送り設定に記録する
 * その後モーダルを閉じて再読み込みをする
 */
const tokenSubmitter = () => {
	var code = $('#code').val();
	var res = ipcRenderer.sendSync('tokenSubmit', code);
	if (res) {
		modalClose('#tokenModal');
		location.reload();
	} else {
		// #tokenModalにアラート出したい
	}
};

/**
 * カレンダー選択を変更したときに呼び出される
 * 今選ばれているカレンダーをメインプロセスに送信して、メインプロセス側で設定に記録する
 * このとき送信されたカレンダーが初期選択となる
 */
const calendarChange = () => {
	var data = $('#calendar').val();
	ipcRenderer.send('changeCalendar', data);
};

/**
 * シフトのチェックボックスの変化に合わせて中のテキストを変える
 * @param  {Event} eo イベントオブジェクト
 */
const shiftFlagChecker = eo => {
	var selector = $(eo.currentTarget).attr('id');
	var value = $(eo.currentTarget).prop('checked');
	ipcRenderer.sendSync('shiftRemember', { selector, value });

	if (value) {
		$(eo.currentTarget)
			.next('.flagText')
			.html('シフト');
	} else {
		$(eo.currentTarget)
			.next('.flagText')
			.html('休み');
	}
};

const applyShiftData = () => {
	$('#applyShiftData i').css('display', 'inline');
	$('#modal').modal();
	$('#modalMessage').empty();
	$('#applyShiftData').prop('disabled', true);
	var year = $('#shiftYear').val();
	var month = $('#shiftMonth').val();
	var calID = $('#shiftCalendar').val();
	var checkedShift = $('input[name="shift"]:checked');
	var allShiftWDays = [];

	for (var i in checkedShift) {
		if (checkedShift[i].value) {
			allShiftWDays.push(checkedShift[i].value);
		}
	}

	var obj = { year, month, calID, allShiftWDays };
	var res = ipcRenderer.sendSync('applyShiftData', obj);
	resultMessage(res);
	$('#applyShiftData i').css('display', 'none');
};

/**
 * BootstrapのモーダルをJSからクローズしたいときに使う
 * @param  {string} selector クローズしたいモーダルのID
 */
const modalClose = selector => {
	$('body').removeClass('modal-open');
	$('.modal-backdrop').remove();
	$(selector).modal('hide');
};

/**
 * モーダルに登録された結果を追加表示する
 * @param  {Object} res   メインプロセスから送られてくるデータ
 */
const resultMessage = res => {
	for (var i in res) {
		var args = res[i];
		var title = args.summary;
		var start = new Date(args.start.dateTime);
		var startYear = start.getFullYear();
		var startMonth = paddingZero(start.getMonth() + 1);
		var startDate = paddingZero(start.getDate());
		var startWDay = start.getDay();
		var startHours = paddingZero(start.getHours());
		var startMinutes = paddingZero(start.getMinutes());
		$('#modalMessage').append(
			`<p>${title} @ ${startYear}/${startMonth}/${startDate} ${
				weekday[startWDay]
			} ${startHours}:${startMinutes}</p>`
		);
	}
};

// eslint-disable-next-line no-unused-vars
const toggleCourse = eo => {
	var selector = $(eo.currentTarget).attr('id');
	var value = $(eo.currentTarget).prop('checked');
	ipcRenderer.sendSync('courseRemember', { selector, value });

	if (value) {
		$(eo.currentTarget)
			.next('.flagText')
			.html('オン');
	} else {
		$(eo.currentTarget)
			.next('.flagText')
			.html('オフ');
	}
};

const applyChatSummary = () => {
	var summary = $('#chatSummary').val();
	ipcRenderer.sendSync('applyChatSummary', summary);
};

const setChatSummary = () => {
	new Promise((resolve, reject) => {
		try {
			var summary = ipcRenderer.sendSync('getChatSummary');
			if (summary) {
				$('#chatSummary').val(summary);
			} else {
				console.error(summary);
			}
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};

const applyMentoringSummary = () => {
	var summary = $('#mentoringSummary').val();
	ipcRenderer.sendSync('applyMentoringSummary', summary);
};

const setMentoringSummary = () => {
	new Promise((resolve, reject) => {
		try {
			var summary = ipcRenderer.sendSync('getMentoringSummary');
			if (summary) {
				$('#mentoringSummary').val(summary);
			} else {
				console.error(summary);
			}
			resolve();
		} catch (e) {
			reject(e);
		}
	});
};

const openSettings = () => {
	ipcRenderer.sendSync('openSettings');
};

const closeSettings = async () => {
	ipcRenderer.sendSync('closeSettings');
};

/**
 * 2桁の0埋めをする
 * @param  {number} int int型の数値
 * @return {string}     0埋めされた二桁の数字を文字列にしたもの
 */
const paddingZero = int => String(int).padStart(2, '0');
