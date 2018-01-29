'use strict';
// Electronのモジュール
const {app, dialog} = require('electron');

const GhReleases = require('electron-gh-releases');

exports.checkUpdate = () => {
	const updater = new GhReleases({
		repo: 'sasagar/tacalexporter',
		currentVersion: app.getVersion()
	});

	updater.check((err, status) => {
		if (!err && status) updater.download();
	});

	updater.on('update-downloaded', (data) => {
		const id = dialog.showMessageBox({
			type: 'info',
			buttons: ['あとで', '再起動して更新する'],
			message: `新しいバージョンをダウンロードしました。今すぐ更新しますか？\n\n${data[2]}\n\n${data[1]}`,
			cancelId: 0
		});

		if (id === 0) return;
		updater.install();
	});
};
