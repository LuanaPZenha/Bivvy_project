import {
  formatPhone,
  isValidEmail,
  isValidPhone,
  normalizePhone,
  passwordStrength,
  validateRegisterForm,
} from '../../src/utils/validation';

describe('validation utils', () => {
  it('validates emails', () => {
    expect(isValidEmail('hiker@example.com')).toBe(true);
    expect(isValidEmail('hiker@example')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('normalizes and formats phones', () => {
    expect(normalizePhone('(206) 555-0134')).toBe('2065550134');
    expect(formatPhone('2065550134')).toBe('(206) 555-0134');
    expect(isValidPhone('206555013')).toBe(false);
    expect(isValidPhone('(206) 555-0134')).toBe(true);
  });

  it('scores password strength', () => {
    expect(passwordStrength('short1')).toBe('weak');
    expect(passwordStrength('onlyletters')).toBe('weak');
    expect(passwordStrength('StrongPass1')).toBe('fair');
    expect(passwordStrength('StrongPass1!extra')).toBe('strong');
  });

  it('collects register form errors', () => {
    const errors = validateRegisterForm({
      name: '',
      email: 'bad',
      phone: '12',
      password: 'weak',
      confirmPassword: 'other',
      acceptedTerms: false,
    });

    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.phone).toBeDefined();
    expect(errors.password).toBeDefined();
    expect(errors.confirmPassword).toBeDefined();
    expect(errors.acceptedTerms).toBeDefined();
  });

  it('passes a valid form', () => {
    const errors = validateRegisterForm({
      name: 'Alex Rivera',
      email: 'hiker@example.com',
      phone: '',
      password: 'StrongPass1',
      confirmPassword: 'StrongPass1',
      acceptedTerms: true,
    });

    expect(Object.values(errors).filter(Boolean)).toHaveLength(0);
  });
});
