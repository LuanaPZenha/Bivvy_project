import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RegisterScreen } from '../../src/screens/RegisterScreen';

const mockRegister = jest.fn();

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

function renderScreen() {
  const navigation = { navigate: jest.fn(), goBack: jest.fn(), getParent: () => ({ goBack: jest.fn() }) };
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

describe('RegisterScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('validates email format before calling register', async () => {
    const { getByLabelText, getByText } = renderScreen();

    fireEvent.changeText(getByLabelText('Email'), 'not-an-email');
    fireEvent.changeText(getByLabelText('Password'), 'StrongPass1!');
    fireEvent.press(getByLabelText('Create account'));

    await waitFor(() => expect(getByText('Enter a valid email address')).toBeTruthy());
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('requires matching passwords', async () => {
    const { getByLabelText, getByText } = renderScreen();

    fireEvent.changeText(getByLabelText('Email'), 'hiker@example.com');
    fireEvent.changeText(getByLabelText('Password'), 'StrongPass1!');
    fireEvent.changeText(getByLabelText('Confirm password'), 'Different1!');
    fireEvent.press(getByLabelText('Create account'));

    await waitFor(() => expect(getByText('Passwords do not match')).toBeTruthy());
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('registers with valid input', async () => {
    mockRegister.mockResolvedValue(undefined);
    const { getByLabelText } = renderScreen();

    fireEvent.changeText(getByLabelText('Name'), 'Alex');
    fireEvent.changeText(getByLabelText('Email'), 'hiker@example.com');
    fireEvent.changeText(getByLabelText('Password'), 'StrongPass1!');
    fireEvent.changeText(getByLabelText('Confirm password'), 'StrongPass1!');
    fireEvent.press(getByLabelText('Create account'));

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith('hiker@example.com', 'StrongPass1!', 'Alex'),
    );
  });
});
