import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './redux/store';

import CheckEmailScreen from './app/screens/CheckEmailScreen';
import CheckPasswordScreen from './app/screens/CheckPasswordScreen';
import HomeScreen from './app/screens/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="CheckEmail" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="CheckEmail" component={CheckEmailScreen} />
          <Stack.Screen name="CheckPassword" component={CheckPasswordScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
