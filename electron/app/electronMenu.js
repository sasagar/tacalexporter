'use strict';
const au = require('./updater');

exports.template = [
	{
		label: '編集',
		submenu: [
			{ role: 'undo', label: '取り消し' },
			{ role: 'redo', label: 'やり直し' },
			{ type: 'separator' },
			{ role: 'cut', label: '切り取り' },
			{ role: 'copy', label: 'コピー' },
			{ role: 'paste', label: '貼り付け' },
			{ role: 'delete', label: '削除' },
			{ role: 'selectall', label: '全てを選択' },
		],
	},
	{
		label: '表示',
		submenu: [
			{ role: 'reload', label: '再読み込み' },
			{ role: 'forcereload', label: '強制再読み込み' },
			//{ role: 'toggledevtools' },
			{ type: 'separator' },
			{ role: 'resetzoom', label: '拡大率リセット' },
			{ role: 'zoomin', label: '拡大' },
			{ role: 'zoomout', label: '縮小' },
			{ type: 'separator' },
			{ role: 'togglefullscreen', label: '全画面表示' },
		],
	},
	{
		role: 'ウィンドウ',
		submenu: [
			{ role: 'minimize', label: '最小化' },
			{ role: 'close', label: '閉じる' },
		],
	},
	{
		role: 'ヘルプ',
		submenu: [
			{
				label: 'Electronについて',
				click() {
					require('electron').shell.openExternal('https://electron.atom.io');
				},
			},
		],
	},
];

exports.darwinTemplate = {
	main: {
		label: 'TAMentorConsole',
		submenu: [
			{ role: 'about', label: 'このアプリについて' },
			{
				label: 'アップデートを確認する...',
				click() {
					au.checkUpdate();
				},
			},
			{ type: 'separator' },
			{ role: 'services', label: 'サービス', submenu: [] },
			{ type: 'separator' },
			{ role: 'hide', label: 'このアプリを隠す' },
			{ role: 'hideothers', label: '他のアプリを隠す' },
			{ role: 'unhide', label: '全てを表示' },
			{ type: 'separator' },
			{ role: 'quit', label: '終了' },
		],
	},
	sub1: [
		{ type: 'separator' },
		{
			label: '読み上げ',
			submenu: [
				{ role: 'startspeaking', label: '開始' },
				{ role: 'stopspeaking', label: '停止' },
			],
		},
	],
	sub2: [
		{ role: 'close', label: '閉じる' },
		{ role: 'minimize', label: '最小化' },
		{ role: 'zoom', label: '拡大' },
		{ type: 'separator' },
		{ role: 'front', label: '全面へ' },
	],
};
