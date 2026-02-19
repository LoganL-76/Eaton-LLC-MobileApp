import { render } from '@testing-library/react-native';
import React from 'react';
import ForgotPasswordScreen from '../../app/(auth)/forgotpassword';

const mockLink = jest.fn(({ children }: any) => <>{children}</>);

jest.mock('../../lib/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#fff',
      },
    },
    isDark: false,
  }),
}));

jest.mock('expo-router', () => ({
  Link: (props: any) => mockLink(props),
}));

describe('Forgot Password Screen (current placeholder)', () => {
  it('renders header text', () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    expect(getByText('Create Account')).toBeTruthy();
    expect(getByText('Sign up to get started')).toBeTruthy();
  });

  it('renders all form fields and CTA button', () => {
    const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);

    expect(getByPlaceholderText('Full Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();

    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('links back to login (href)', () => {
    render(<ForgotPasswordScreen />);

    expect(mockLink).toHaveBeenCalled();

    const calls = mockLink.mock.calls.map((c) => c[0]);
    const loginLinkCall = calls.find((props) => props?.href === '/(auth)/login');

    expect(loginLinkCall).toBeTruthy();
  });
});
