'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

class LocalImageStore {
  constructor({ rootDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads') } = {}) {
    this.rootDir = rootDir;
    this.maxBytes = Number(process.env.UPLOAD_MAX_BYTES) || 5 * 1024 * 1024;
    this.maxImagesPerListing = Number(process.env.UPLOAD_MAX_PER_LISTING) || 5;
    this.ensureDir();
  }

  ensureDir() {
    fs.mkdirSync(this.rootDir, { recursive: true });
  }

  assertAllowed({ contentType, size }) {
    if (!ALLOWED_MIME.has(contentType)) {
      const err = new Error('Only JPEG, PNG, and WebP images are allowed');
      err.status = 400;
      throw err;
    }
    if (size != null && Number(size) > this.maxBytes) {
      const err = new Error(`Image exceeds max size of ${this.maxBytes} bytes`);
      err.status = 400;
      throw err;
    }
  }

  /**
   * Persist a buffer and return metadata (id + filename on disk).
   */
  async saveBuffer({ buffer, contentType }) {
    this.assertAllowed({ contentType, size: buffer.length });
    const id = crypto.randomUUID();
    const ext = EXT_BY_MIME[contentType] || '.bin';
    const filename = `${id}${ext}`;
    const fullPath = path.join(this.rootDir, filename);
    await fs.promises.writeFile(fullPath, buffer);
    return {
      id,
      filename,
      contentType,
      size: buffer.length,
      createdAt: new Date().toISOString(),
    };
  }

  resolvePath(filename) {
    const safe = path.basename(filename);
    return path.join(this.rootDir, safe);
  }

  async readFile(filename) {
    const fullPath = this.resolvePath(filename);
    return fs.promises.readFile(fullPath);
  }

  async deleteFile(filename) {
    const fullPath = this.resolvePath(filename);
    try {
      await fs.promises.unlink(fullPath);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
}

module.exports = { LocalImageStore, ALLOWED_MIME };
