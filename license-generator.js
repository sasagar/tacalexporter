const execSync = require("child_process").execSync;
const path = require("path");
const fs = require("fs");
const compareVersions = require("compare-versions");

const filePath = path.join(__dirname, "src/assets/licenses/licenses.json");

// 元情報となるライセンス一覧のJSONを出力
const ret = execSync(`license-checker --production --json > ${filePath}`);
if (ret.error) {
  console.error("Error " + JSON.stringify(ret.error, null, 4));
  process.exit(1);
}

// 出力されたJSONファイルを読み込む
const licenses = JSON.parse(fs.readFileSync(filePath, "utf8"));
const licenseKeys = Object.keys(licenses);
const newLicenses = {};
const versions = {};

licenseKeys.forEach((key) => {
  const license = licenses[key];
  delete license.path;
  delete license.licenseFile;
  // 自作ライブラリ(private=true)を除外
  if (!license.private) {
    const tmp = key.match(/(.+)@(.+)$/);
    const name = tmp[1];
    const version = tmp[2];
    if (!Object.prototype.hasOwnProperty.call(versions, name)) {
      newLicenses[key] = license;
      versions[name] = version;
    } else if (compareVersions(versions[name], version) < 1) {
      // 重複している場合、最新バージョンのみ含める
      delete newLicenses[name + "@" + versions[name]];
      newLicenses[key] = license;
      versions[name] = version;
    }
  }
});

fs.writeFileSync(filePath, JSON.stringify(newLicenses, null, 4));
