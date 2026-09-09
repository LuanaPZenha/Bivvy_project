import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RegisterScreen } from '../../src/screens/RegisterScreen';

const mockRegister = jest.fn();

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

function renderScreen() {
  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    getParent: () => ({ goBack: jest.fn() }),
  };
  const utils = render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <RegisterScreen navigation={navigation as never} route={{ key: 'r', name: 'Register' }} />
    </SafeAreaProvider>,
  );
  return { ...utils, navigation };
}

function fillValidForm(getByLabelText: ReturnType<typeof renderScreen>['getByLabelText']) {
  fireEvent.changeText(getByLabelText('Full name'), 'Alex Rivera');
  fireEvent.changeText(getByLabelText('Email'), 'hiker@example.com');
  fireEvent.changeText(getByLabelText('Password'), 'StrongPass1');
  fireEvent.changeText(getByLabelText('Confirm password'), 'StrongPass1');
  fireEvent.press(getByLabelText('Accept terms'));
}

describe('RegisterScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reports per-field errors on empty submit', async () => {
    const { getByLabelText, getByText } = renderScreen();

    fireEvent.press(getByLabelText('Create account'));

    await waitFor(() => expect(getByText('Enter your name')).toBeTruthy());
    expect(getByText('Enter your email')).toBeTruthy();
    expect(getByText('Create a password')).toBeTruthy();
    expect(getByText('Accept the Terms to continue')).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('validates email, password match, and phone', async () => {
    const { getByLabelText, getByText } = renderScreen();

    fireEvent.changeText(getByLabelText('Full name'), 'Alex Rivera');
    fireEvent.changeText(getByLabelText('Email'), 'not-an-email');
    fireEvent.changeText(getByLabelText('Phone (optional)'), '123');
    fireEvent.changeText(getByLabelText('Password'), 'StrongPass1');
    fireEvent.changeText(getByLabelText('Confirm password'), 'Different1');
    fireEvent.press(getByLabelText('Accept terms'));
    fireEvent.press(getByLabelText('Create account'));

    await waitFor(() => expect(getByText('Enter a valid email address')).toBeTruthy());
    expect(getByText('Enter a valid phone number')).toBeTruthy();
    expect(getByText('Passwords do not match')).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('formats the phone number as digits are typed', () => {
    const { getByLabelText } = renderScreen();
    const phone = getByLabelText('Phone (optional)');

    fireEvent.changeText(phone, '2065550134');

    expect(phone.props.value).toBe('(206) 555-0134');
  });

  it('submits normalized values when the form is valid', async () => {
    mockRegister.mockResolvedValue(undefined);
    const { getByLabelText } = renderScreen();

    fillValidForm(getByLabelText);
    fireEvent.changeText(getByLabelText('Phone (optional)'), '2065550134');
    fireEvent.press(getByLabelText('Create account'));

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'hiker@example.com',
        password: 'StrongPass1',
        name: 'Alex Rivera',
        phone: '2065550134',
        acceptTerms: true,
        marketingOptIn: false,
      }),
    );
  });

  it('surfaces API errors', async () => {
    mockRegister.mockRejectedValue(new Error('Email already registered'));
    const { getByLabelText, getByText } = renderScreen();

    fillValidForm(getByLabelText);
    fireEvent.press(getByLabelText('Create account'));

    await waitFor(() => expect(getByText('Email already registered')).toBeTruthy());
  });
});
