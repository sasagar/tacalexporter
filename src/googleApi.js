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
