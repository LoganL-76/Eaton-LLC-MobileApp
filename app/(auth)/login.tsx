import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';


export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // no authentication yet, just navigate to the main app
    router.replace('/(tabs)/myjobs');
  };
  // Build styles inside component to have access to theme values
  const styles = makeStyles(theme);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor= {theme.colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            // TODO: Add value and onChangeText
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor= {theme.colors.textTertiary}
            secureTextEntry
            autoComplete="password"
            // TODO: Add value and onChangeText
          />

          <TouchableOpacity 
            style={styles.button}
            onPress = {handleSignIn}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <Link href="/(auth)/forgotpassword" asChild>
            <TouchableOpacity style={styles.linkContainer}>
              <Text style={styles.linkText}>
                Forgot your password? <Text style={styles.linkBold}>Reset it</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(theme: ReturnType<typeof import('../../lib/ThemeContext').useTheme>['theme']) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  form: {
    gap: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  linkContainer: {
    marginTop: theme.spacing.md,
  },
  linkText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  linkBold: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});
}