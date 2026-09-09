export type PasswordStrength = 'weak' | 'fair' | 'strong';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

/** Digits only; US numbers are 10 digits, allow country code up to 15. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone);
  return digits.length >= 10 && digits.length <= 15;
}

export function formatPhone(phone: string): string {
  const digits = normalizePhone(phone).slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function passwordStrength(password: string): PasswordStrength {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (password.length < 8 || !hasLetter || !hasNumber) return 'weak';
  if (password.length >= 12 && hasSymbol) return 'strong';
  return 'fair';
}

export type RegisterFormValues = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;

export function validateRegisterForm(values: RegisterFormValues): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Enter your name';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name is too short';
  }

  if (!values.email.trim()) {
    errors.email = 'Enter your email';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (values.phone.trim() && !isValidPhone(values.phone)) {
    errors.phone = 'Enter a valid phone number';
  }

  if (!values.password) {
    errors.password = 'Create a password';
  } else if (passwordStrength(values.password) === 'weak') {
    errors.password = 'Use at least 8 characters with letters and numbers';
  }

  if (values.password && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = 'Accept the Terms to continue';
  }

  return errors;
}
