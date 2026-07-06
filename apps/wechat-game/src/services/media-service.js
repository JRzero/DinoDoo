const { getWx } = require("../core/env");

class MediaService {
  chooseImage() {
    const wxApi = getWx();
    if (wxApi && wxApi.chooseMedia) {
      return new Promise((resolve, reject) => {
        wxApi.chooseMedia({
          count: 1,
          mediaType: ["image"],
          sourceType: ["album", "camera"],
          success: resolve,
          fail: reject,
        });
      });
    }
    return Promise.resolve({ tempFiles: [] });
  }
}

module.exports = { MediaService };
