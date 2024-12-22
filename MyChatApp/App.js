import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './redux/store';

import CheckEmailScreen from './app/screens/CheckEmailScreen';
import CheckPasswordScreen from './app/screens/CheckPasswordScreen';
import HomeScreen from './app/screens/HomeScreen';
import ChatScreen from './app/screens/ChatScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="CheckEmail" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="CheckEmail" component={CheckEmailScreen} />
          <Stack.Screen name="CheckPassword" component={CheckPasswordScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />  {/* Đảm bảo "Chat" được khai báo đúng */}
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
