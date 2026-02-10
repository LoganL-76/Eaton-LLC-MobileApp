import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Check if user is authenticated
  // if authenticated, redirect to (tabs)
  // for now, we will always redirect to login
  return <Redirect href="/(auth)/login" />;
}