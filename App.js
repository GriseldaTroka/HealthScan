import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from './src/context/UserContext';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export default function App() {
  return (
    <UserProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </UserProvider>
  );
}