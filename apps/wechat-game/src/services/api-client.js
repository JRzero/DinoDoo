const { getWx } = require("../core/env");

class ApiClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || "http://localhost:8080";
  }

  get(path) {
    return this.request("GET", path);
  }

  post(path, data) {
    return this.request("POST", path, data);
  }

  put(path, data) {
    return this.request("PUT", path, data);
  }

  request(method, path, data) {
    const wxApi = getWx();
    if (wxApi && wxApi.request) {
      return new Promise((resolve, reject) => {
        wxApi.request({
          url: this.baseUrl + path,
          method,
          data,
          header: { "content-type": "application/json" },
          success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(res.data);
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          },
          fail: reject,
        });
      });
    }
    return Promise.resolve(this.mock(method, path, data));
  }

  upload(path, filePath, name = "file", formData = {}) {
    const wxApi = getWx();
    if (wxApi && wxApi.uploadFile) {
      return new Promise((resolve, reject) => {
        wxApi.uploadFile({
          url: this.baseUrl + path,
          filePath,
          name,
          formData,
          success: (res) => resolve(safeJson(res.data)),
          fail: reject,
        });
      });
    }
    return Promise.resolve({ ok: true, filePath, formData });
  }

  mock(method, path, data) {
    if (path === "/api/v1/dinos") {
      return {
        dinos: [
          { code: "xiaobao", name: "小暴" },
          { code: "adai", name: "阿呆" },
          { code: "gulu", name: "咕噜" },
        ],
      };
    }
    if (path === "/api/v1/themes") {
      return { themes: [{ code: "adventure", name: "彩虹森林" }] };
    }
    if (path === "/api/v1/parent/settings") {
      return { enabled_themes: ["adventure"], daily_limit_minutes: 12, voice_enabled: true, image_generation_enabled: true };
    }
    if (method === "PUT" && path === "/api/v1/parent/settings") {
      return data;
    }
    if (path === "/api/v1/artifacts") {
      return { artifacts: [] };
    }
    return { ok: true };
  }
}

function safeJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

module.exports = { ApiClient };
