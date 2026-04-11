const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../../sessions.json");

function saveSession(data) {
  let sessions = [];

  if (fs.existsSync(FILE)) {
    sessions = JSON.parse(fs.readFileSync(FILE));
  }

  sessions.push(data);
  fs.writeFileSync(FILE, JSON.stringify(sessions, null, 2));
}

module.exports = { saveSession };