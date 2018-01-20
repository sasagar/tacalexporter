'use strict';

// Electronのモジュール
const electron = require('electron');

// pathモジュール
const path = require('path');

// アプリケーションをコントロールするモジュール
const app = electron.app;

// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow;

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// Electronの初期化完了後に実行
app.on('ready', function () {
	// メイン画面の表示。ウィンドウの幅、高さを指定できる
	mainWindow = new BrowserWindow({ width: 800, height: 600, webPreferences: { nodeIntegration: false } });
	mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));

	// ウィンドウが閉じられたらアプリも終了
	mainWindow.on('closed', function () {
		mainWindow = null;
	});
});
