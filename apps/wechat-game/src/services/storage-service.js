const { getWx } = require("../core/env");

class StorageService {
  get(key, fallback) {
    const wxApi = getWx();
    if (wxApi && wxApi.getStorageSync) {
      const value = wxApi.getStorageSync(key);
      return value === "" || value === undefined ? fallback : value;
    }
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }
    return fallback;
  }

  set(key, value) {
    const wxApi = getWx();
    if (wxApi && wxApi.setStorageSync) {
      wxApi.setStorageSync(key, value);
      return;
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
}

module.exports = { StorageService };
