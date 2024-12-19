import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Provider } from 'react-redux';
import { store } from './redux/store';

import CheckEmailScreen from './app/screens/CheckEmailScreen';
import CheckPasswordScreen from './app/screens/CheckPasswordScreen';
import HomeScreen from './app/screens/HomeScreen';
import Sidebar from './app/screens/Sidebar';  // Import Sidebar

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();


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
