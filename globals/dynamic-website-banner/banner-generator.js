const os = require("os");
const fs = require("fs");
const { URL, URLSearchParams } = require("node:url");

const preferences = JSON.parse(fs.readFileSync("preferences.json"));

const cpuUsage = os.cpus().reduce((total, cpu) => total + cpu.times.user, 0);
const memoryUsage = (os.freemem() / os.totalmem()) * 100;
const uptime = os.uptime();

const date = new Date();
const hour = date.getHours();
let greeting = "";

if (hour >= 6 && hour < 12) {
  greeting = "Good morning";
} else if (hour >= 12 && hour < 18) {
  greeting = "Good afternoon";
} else {
  greeting = "Happy evening";
}

const bannerHTML = `
  <div style="background-color: ${preferences.color}; font-family: ${
  preferences.font
}; color: ${preferences.textColor}; padding: 20px;">
    <h1>${greeting}</h1>
    <p>CPU Usage: ${cpuUsage.toFixed(2)}%</p>
    <p>Memory Usage: ${memoryUsage.toFixed(2)}%</p>
    <p>Uptime: ${uptime.toFixed(0)} seconds</p>
  </div>
`;

const url = new URL("index.html", "file://");
const searchParams = new URLSearchParams(url.search);
searchParams.set("banner", bannerHTML);
url.search = searchParams.toString();

const updatedIndex = fs
  .readFileSync("index.html", "utf-8")
  .replace(/<div id="banner"><\/div>/, `<div id="banner">${bannerHTML}</div>`);

fs.writeFileSync(url, updatedIndex);

console.log("Banner updated successfully!");
