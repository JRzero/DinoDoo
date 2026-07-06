const { ASSET_MANIFEST } = require("../assets/manifest");
const { createImage } = require("./env");

class ResourceLoader {
  constructor(manifest = ASSET_MANIFEST) {
    this.manifest = manifest;
    this.images = new Map();
  }

  getAsset(id) {
    return this.manifest.backgrounds[id] || this.manifest.sprites[id] || null;
  }

  getImage(id) {
    return this.images.get(id) || null;
  }

  async loadAll() {
    const entries = [
      ...Object.entries(this.manifest.backgrounds),
      ...Object.entries(this.manifest.sprites),
    ];
    await Promise.all(entries.map(([id, asset]) => this.loadImage(id, asset)));
  }

  loadImage(id, asset) {
    return new Promise((resolve) => {
      const image = createImage();
      if (!image || !asset.path) {
        resolve(null);
        return;
      }
      image.onload = () => {
        this.images.set(id, image);
        resolve(image);
      };
      image.onerror = () => resolve(null);
      image.src = asset.path;
    });
  }
}

module.exports = { ResourceLoader };
