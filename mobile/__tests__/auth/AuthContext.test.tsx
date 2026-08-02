import React from 'react';
import { Text, Pressable } from 'react-native';
import { act, render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../src/auth/AuthContext';

const mockSaveTokens = jest.fn();
const mockSaveUser = jest.fn();
const mockClearSession = jest.fn();
const mockGetAccessToken = jest.fn();
const mockGetStoredUser = jest.fn();
const mockLoginRequest = jest.fn();
const mockRegisterRequest = jest.fn();

jest.mock('../../src/security/secureCredentials', () => ({
  saveTokens: (...args: unknown[]) => mockSaveTokens(...args),
  saveUser: (...args: unknown[]) => mockSaveUser(...args),
  clearSession: (...args: unknown[]) => mockClearSession(...args),
  getAccessToken: (...args: unknown[]) => mockGetAccessToken(...args),
  getStoredUser: (...args: unknown[]) => mockGetStoredUser(...args),
}));

jest.mock('../../src/services/api', () => ({
  loginRequest: (...args: unknown[]) => mockLoginRequest(...args),
  registerRequest: (...args: unknown[]) => mockRegisterRequest(...args),
}));

function Probe() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <>
      <Text>{isAuthenticated ? `hi:${user?.email}` : 'guest'}</Text>
      <Pressable
        accessibilityLabel="do-login"
        onPress={() => login('hiker@example.com', 'StrongPass1!')}
      />
      <Pressable accessibilityLabel="do-logout" onPress={() => logout()} />
    </>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccessToken.mockResolvedValue(null);
    mockGetStoredUser.mockResolvedValue(null);
  });

  it('logs in, persists session, and logs out', async () => {
    mockLoginRequest.mockResolvedValue({
      user: { id: '1', email: 'hiker@example.com', name: 'Alex' },
      accessToken: 'access',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresIn: '15m',
    });

    const { getByText, getByLabelText } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(getByText('guest')).toBeTruthy());

    await act(async () => {
      fireEvent.press(getByLabelText('do-login'));
    });

    await waitFor(() => expect(getByText('hi:hiker@example.com')).toBeTruthy());
    expect(mockSaveTokens).toHaveBeenCalledWith('access', 'refresh');
    expect(mockSaveUser).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(getByLabelText('do-logout'));
    });

    await waitFor(() => expect(getByText('guest')).toBeTruthy());
    expect(mockClearSession).toHaveBeenCalled();
  });
});
