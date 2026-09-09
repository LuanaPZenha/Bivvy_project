import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from '../../src/screens/LoginScreen';

const mockLogin = jest.fn();

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

function renderScreen() {
  const goBack = jest.fn();
  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    getParent: () => ({ goBack }),
  };
  const utils = render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <LoginScreen navigation={navigation as never} route={{ key: 'l', name: 'Login' }} />
    </SafeAreaProvider>,
  );
  return { ...utils, navigation, goBack };
}

describe('LoginScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reports per-field errors on empty submit', async () => {
    const { getByLabelText, getByText } = renderScreen();

    fireEvent.press(getByLabelText('Sign in'));

    await waitFor(() => expect(getByText('Enter your email')).toBeTruthy());
    expect(getByText('Enter your password')).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('rejects a malformed email', async () => {
    const { getByLabelText, getByText } = renderScreen();

    fireEvent.changeText(getByLabelText('Email'), 'not-an-email');
    fireEvent.changeText(getByLabelText('Password'), 'StrongPass1');
    fireEvent.press(getByLabelText('Sign in'));

    await waitFor(() => expect(getByText('Enter a valid email address')).toBeTruthy());
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('signs in and closes the auth flow', async () => {
    mockLogin.mockResolvedValue(undefined);
    const { getByLabelText, goBack } = renderScreen();

    fireEvent.changeText(getByLabelText('Email'), 'demo@bivvy.test');
    fireEvent.changeText(getByLabelText('Password'), 'BivvyDemo123');
    fireEvent.press(getByLabelText('Sign in'));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('demo@bivvy.test', 'BivvyDemo123'));
    expect(goBack).toHaveBeenCalled();
  });

  it('surfaces invalid credentials from the API', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    const { getByLabelText, getByText } = renderScreen();

    fireEvent.changeText(getByLabelText('Email'), 'demo@bivvy.test');
    fireEvent.changeText(getByLabelText('Password'), 'wrong-pass');
    fireEvent.press(getByLabelText('Sign in'));

    await waitFor(() => expect(getByText('Invalid credentials')).toBeTruthy());
  });

  it('toggles password visibility', () => {
    const { getByLabelText } = renderScreen();

    expect(getByLabelText('Password').props.secureTextEntry).toBe(true);
    fireEvent.press(getByLabelText('Show Password'));
    expect(getByLabelText('Password').props.secureTextEntry).toBe(false);
  });
});
