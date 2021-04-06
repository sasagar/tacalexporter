// const path = require("path");
const { google } = require("googleapis");
const clientSecret = require("./json/client_secret.json");
const log = require("electron-log");

exports.getClientSecret = () => {
  return clientSecret;
};

exports.OAuth2 = (credentials) => {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUrl
  );

  return oauth2Client;
};

exports.userInfo = (auth) => {
  let profApi = google.oauth2("v2");
  let apiObj = { auth: auth };
  return new Promise((resolve, reject) => {
    profApi.userinfo.v2.me.get(apiObj, (err, prof) => {
      if (err) {
        log.error("There was an error contacting the Profile service: " + err);
        reject(err);
      }
      resolve(prof.data);
    });
  });
};

exports.listCalendar = (auth) => {
  const calendar = google.calendar("v3");
  let apiObj = { auth: auth };
  return new Promise((resolve, reject) => {
    calendar.calendarList.list(apiObj, (err, list) => {
      if (err) {
        log.error(
          "There was an error contacting the Calendar service at listCalendar: " +
            err
        );
        reject(err);
      }
      resolve(list.data.items);
    });
  });
};

exports.addSchedule = (auth, sch) => {
  const calendar = google.calendar("v3");

  const title = sch.title;
  const calendarId = sch.cal;

  const start = sch.start;
  const end = sch.end;

  const allDay = sch.allDay;

  const resource = {
    summary: title,
    start: {
      timezone: "Asia/Tokyo",
    },
    end: {
      timezone: "Asia/Tokyo",
    },
  };

  // 時間部分と予定の空き表示対応
  if (allDay) {
    resource.start.date = start;
    // 終日は同日にしないと2日間になっちゃう
    resource.end.date = start;
    resource.transparency = "transparent";
  } else {
    resource.start.dateTime = start;
    resource.end.dateTime = end;
  }

  const apiObj = {
    auth,
    calendarId,
    resource,
  };

  return new Promise((resolve, reject) => {
    calendar.events.insert(apiObj, (err, event) => {
      if (err) {
        log.error("There was an error contacting the Calendar service: " + err);
        reject(new Error(err));
      } else {
        log.info(`Event created: ${event.data.summary} ${event.data.start}`);
        resolve(true);
      }
    });
  });
};
