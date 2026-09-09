'use strict';

/** US-focused phone value object; stores digits only. */
class Phone {
  constructor(raw) {
    const digits = String(raw ?? '').replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      const err = new Error('Invalid phone number');
      err.status = 400;
      throw err;
    }
    this.value = digits;
  }

  toString() {
    return this.value;
  }
}

module.exports = { Phone };
