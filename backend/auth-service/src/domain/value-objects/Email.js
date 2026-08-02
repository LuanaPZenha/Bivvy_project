'use strict';

class Email {
  constructor(value) {
    const normalized = String(value || '')
      .trim()
      .toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error('Invalid email');
    }
    this.value = normalized;
  }

  toString() {
    return this.value;
  }
}

module.exports = { Email };
