"use strict";

import { app, protocol, BrowserWindow, Menu, ipcMain, shell } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";

const path = require("path");

import { template, darwinTemplate } from "./scripts/menu";

import ElectronStore from "electron-store";
import "./autoUpdate";

const log = require("electron-log");

const google = require("./googleApi.js");

// スコープの設定
// カレンダーAPIと個人情報用のAPIを許可するようにスコープ指定
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const DEFAULT_WINDOW_SIZE = [800, 600];

const schema = {
  window: {
    type: "object",
    default: { pos: [800, 600], size: [800, 600] },
  },
  shiftSettings: {
    type: "object",
    default: {},
  },
  courseSettings: {
    type: "object",
    default: {},
  },
  mentoringTitle: {
    type: "string",
    default: "メンタリング %name %courseid%week",
  },
  accountingTitle: {
    type: "string",
    default: "%courseid%week %name 計上日",
  },
  shiftTitle: {
    type: "string",
    default: "チャットシフト",
  },
  shiftSelectedCal: {
    type: "string",
    default: "",
  },
  token: {
    type: "object",
    default: {},
  },
};

const migrations = {
  "5.0.0": (store) => {
    store.set("dbVersion", "5.0.0");
  },
};

const conf = new ElectronStore({ schema, migrations });

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  const pos = conf.get("window.pos") || getCenterPosition();
  const size = conf.get("window.size") || [800, 600];
  // Create the browser window.
  const win = new BrowserWindow({
    width: size[0],
    height: size[1],
    x: pos[0],
    y: pos[1],
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      nodeIntegration: false,
      contextIsolation: false,
      preload: path.join(__static, "preload.js"),
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  win.on("close", () => {
    conf.set("window.pos", win.getPosition()); // ウィンドウの座標を記録
    conf.set("window.size", win.getSize()); // ウィンドウのサイズを記録
  });

  if (process.platform === "darwin") {
    template.unshift(darwinTemplate.main);

    // Edit menu
    template[1].submenu = template[1].submenu.concat(
      template[1].submenu,
      darwinTemplate.sub1
    );

    // Window menu
    template[3].submenu = darwinTemplate.sub2;
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

/**
 * ウィンドウの中央の座標を返却
 *
 * @return {array}
 */
function getCenterPosition() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const x = Math.floor((width - DEFAULT_WINDOW_SIZE[0]) / 2);
  const y = Math.floor((height - DEFAULT_WINDOW_SIZE[1]) / 2);
  return [x, y];
}

/********************************
 * ipc
 */

/**
 * 設定の保存
 *
 * @param {object}
 *
 * @return {boolean}
 */
ipcMain.handle("save-settings", (e, settings) => {
  try {
    conf.set(settings.name, settings.setting);
  } catch (error) {
    log.error(error);
    return false;
  }
  return true;
});

/**
 * 設定の取得
 *
 * @param {string}
 *
 * @return {boolean}
 */
ipcMain.handle("get-settings", (e, name) => {
  try {
    const settings = conf.get(name);
    return settings;
  } catch (error) {
    log.error(error);
    return false;
  }
});

/**
 * 起動時チェック
 *
 * @returns {boolean}
 */
ipcMain.handle("launch-checker", async () => {
  try {
    const res = await authChecker();
    return res;
  } catch (error) {
    log.error(error);
    return false;
  }
});

/**
 * バージョン取得
 *
 * @returns {boolean}
 */
ipcMain.handle("get-ver", async () => {
  try {
    const version = app.getVersion();
    return version;
  } catch (error) {
    log.error(error);
    return false;
  }
});

/**
 * Google認証コードの登録
 *
 * @returns {boolean}
 */
ipcMain.handle("google-code", (e, code) => {
  return new Promise((resolve, reject) => {
    try {
      const clientSecret = google.getClientSecret();
      const oauth2Client = google.OAuth2(clientSecret);
      oauth2Client.getToken(code, (err, token) => {
        if (err) {
          log.error("Error while trying to retrieve access token", err);
          reject(false);
        }
        oauth2Client.credentials = token;
        conf.set("token", token);

        resolve(true);
      });
    } catch (error) {
      log.error(error);
      reject(false);
    }
  });
});

/**
 * ユーザー情報の取得
 *
 * @returns {object}
 */
ipcMain.handle("google-profile", async () => {
  try {
    const content = await google.getClientSecret();
    const tokenedAuth = await authorize(content);
    const res = await google.userInfo(tokenedAuth);
    return res;
  } catch (e) {
    log.error("Error at ipc: google-profile: " + e);
    return false;
  }
});

/**
 * カレンダーリストの取得
 *
 * @returns {object}
 */
ipcMain.handle("google-cal-list", async () => {
  try {
    const content = await google.getClientSecret();
    const tokenedAuth = await authorize(content);
    const res = await google.listCalendar(tokenedAuth);
    return res;
  } catch (e) {
    log.error("Error at ipc: google-cal-list: " + e);
    return false;
  }
});

/**
 * 予定登録
 *
 * @returns {boolean}
 */
ipcMain.handle("google-cal-regist", async (e, obj) => {
  try {
    const sch = JSON.parse(obj);

    const content = await google.getClientSecret();
    const tokenedAuth = await authorize(content);

    let result = await google.addSchedule(tokenedAuth, sch);

    if (typeof result === Error) {
      log.error("Error at ipc: google-cal-regist: " + result);
      result = false;
    }
    return result;
  } catch (e) {
    log.error("Error at ipc: google-cal-regist: " + e);
    return false;
  }
});
/**
 * ログアウト
 *
 * @returns {object}
 */
ipcMain.handle("google-logout", () => {
  try {
    conf.set("token", {});
    return true;
  } catch (e) {
    log.error("Error at ipc: google-logout: " + e);
    return false;
  }
});

/********************************
 * Google API
 */
const authChecker = () => {
  return new Promise((resolve, reject) => {
    const token = conf.get("token");
    const clientSecret = google.getClientSecret();
    const oauth2Client = google.OAuth2(clientSecret);

    if (Object.keys(token).length === 0) {
      log.info("authChecker: token.length is zero.");

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
      });

      shell.openExternal(authUrl);

      reject(false);
    } else {
      const date = new Date();

      if (token.expiry_date < date.getTime()) {
        log.info("authChecker: token renew.");
        oauth2Client.credentials = token;

        oauth2Client
          .getAccessToken()
          .then((tokens) => {
            conf.set("token", tokens.res.data);
          })
          .then(() => {
            resolve(true);
          })
          .catch((err) => {
            log.error(err);
            if (err) {
              log.error("authChecker: error " + err);
              const authUrl = oauth2Client.generateAuthUrl({
                access_type: "offline",
                scope: SCOPES,
              });
              shell.openExternal(authUrl);
              reject(false);
            }
          });
      } else {
        resolve(true);
      }
    }
  });
};

const authorize = () => {
  return new Promise((resolve, reject) => {
    const token = conf.get("token");
    const clientSecret = google.getClientSecret();
    const oauth2Client = google.OAuth2(clientSecret);

    if (Object.keys(token).length === 0) {
      reject(false);
    } else {
      oauth2Client.credentials = token;
      resolve(oauth2Client);
    }
  });
};

/********************************
 * Error Logging
 */

/**
 * プロセスまで来たエラーの記録
 * @param {error}
 *
 * @return {void}
 */
process.on("uncaughtException", (err) => {
  log.error(err); // ログファイルへ記録
  app.quit(); // アプリを終了する (継続しない方が良い)
});
