'use strict';
// configを使う。
const Config = require('electron-config');

exports.config = new Config({
	defaults: {
		bounds: {
			width: 800,
			height: 600,
		},
		calendar: {
			selected: '',
		},
		credentials: {
			token: '',
		},
		summary: {
			mentoring: 'メンタリング %name %courseid%week',
			shift: 'チャットシフト',
			salary: '%courseid%week %name 計上日',
		},
		shift: {
			'mon1-1': false,
			'tue2-1': false,
			'wed3-1': false,
			'thu4-1': false,
			'fri5-1': false,
			'sat6-1': false,
			'sun0-1': false,
			'mon1-2': false,
			'tue2-2': false,
			'wed3-2': false,
			'thu4-2': false,
			'fri5-2': false,
			'sat6-2': false,
			'sun0-2': false,
		},
	},
});
