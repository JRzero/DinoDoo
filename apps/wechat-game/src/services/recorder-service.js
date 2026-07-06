const { getWx } = require("../core/env");

class RecorderService {
  constructor() {
    const wxApi = getWx();
    this.manager = wxApi && wxApi.getRecorderManager ? wxApi.getRecorderManager() : null;
    this.recording = false;
  }

  start() {
    if (this.manager) {
      this.manager.start({ duration: 10000, format: "mp3" });
    }
    this.recording = true;
  }

  stop() {
    if (this.manager) {
      this.manager.stop();
    }
    this.recording = false;
  }

  toggle() {
    if (this.recording) {
      this.stop();
      return false;
    }
    this.start();
    return true;
  }
}

module.exports = { RecorderService };
