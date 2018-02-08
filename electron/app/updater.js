'use strict';
// Electronのモジュール
const { app, dialog } = require('electron');

const GhReleases = require('electron-gh-releases');

exports.checkUpdate = () => {
	const updater = new GhReleases({
		repo: 'sasagar/tacalexporter',
		currentVersion: app.getVersion(),
	});

	updater.check((err, status) => {
		if (!err && status) {
			const userAction = dialog.showMessageBox({
				type: 'info',
				buttons: ['今はしない', 'ダウンロードする'],
				message: '新しいバージョンがあります。今すぐダウンロードしますか？',
				cancelId: 0,
			});
			if (userAction !== 0) {
				updater.download();
			}
		} else {
			dialog.showMessageBox({
				type: 'none',
				buttons: ['OK'],
				message: '新しいバージョンは見つかりませんでした。',
			});
		}
	});

	updater.on('update-downloaded', data => {
		const id = dialog.showMessageBox({
			type: 'info',
			buttons: ['あとで', '再起動して更新する'],
			message: `新しいバージョンをダウンロードしました。今すぐ更新しますか？\n\n
				${data[2]}\n\n
				${data[1]}
			`,
			cancelId: 0,
		});

		if (id === 0) return;
		updater.install();
	});
};
