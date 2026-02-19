import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../../app/(auth)/login';

// --- Jest-safe mocks (must start with "mock" due to hoisting rules) ---

const mockReplace = jest.fn();
const mockLink = jest.fn(({ children }: any) => <>{children}</>);

jest.mock('expo-router', () => ({
  router: {
    replace: (path: string) => mockReplace(path),
  },
  Link: (props: any) => mockLink(props),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('../../lib/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    theme: {
      colors: {
        background: '#ffffff',
        surfaceSecondary: '#f2f2f2',
        border: '#cccccc',
        primary: '#0a84ff',
        text: '#111111',
        textSecondary: '#444444',
        textTertiary: '#777777',
        textInverse: '#ffffff',
      },
      spacing: { sm: 8, md: 12, lg: 16, xxl: 32 },
      borderRadius: { md: 10 },
      fontSize: { md: 16, xxxl: 32 },
      fontWeight: { semibold: '600' },
    },
  }),
}));

describe('LoginScreen (M-34)', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockLink.mockClear();
  });

  it('renders the key UI elements', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Sign in to continue')).toBeTruthy();

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();

    expect(getByText('Sign In')).toBeTruthy();
  });

  it('navigates to main tabs on Sign In press', () => {
    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText('Sign In'));

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/myjobs');
  });

  it('wires Forgot Password link to the correct route', () => {
    render(<LoginScreen />);

    expect(mockLink).toHaveBeenCalled();

    const calls = mockLink.mock.calls;
    const matchingCall = calls.find(
      ([props]) => props?.href === '/(auth)/forgotpassword'
    );

    expect(matchingCall).toBeTruthy();
  });
});
