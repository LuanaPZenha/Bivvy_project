import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ListingDetailScreen } from '../screens/ListingDetailScreen';
import { BookingRequestScreen } from '../screens/BookingRequestScreen';
import { MyRentalsScreen } from '../screens/MyRentalsScreen';
import { MyListingsScreen } from '../screens/MyListingsScreen';
import { CartScreen } from '../screens/CartScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { colors } from '../theme/tokens';
import type {
  AuthStackParamList,
  ExploreStackParamList,
  MainTabParamList,
  RootStackParamList,
} from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const ExploreStack = createNativeStackNavigator<ExploreStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.cream,
    card: colors.cream,
    primary: colors.forest,
    text: colors.ink,
    border: colors.border,
  },
};

function ExploreNavigator() {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
      <ExploreStack.Screen name="Home" component={HomeScreen} />
      <ExploreStack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <ExploreStack.Screen name="BookingRequest" component={BookingRequestScreen} />
    </ExploreStack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator initialRouteName="Register" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.creamCard,
          borderTopColor: colors.border,
          // Keep the tab bar above absolute footers on web so Profile/Explore stay clickable.
          zIndex: 30,
          elevation: 30,
        },
        tabBarIcon: ({ color, size }) => {
          const icon =
            route.name === 'Explore' ? ('compass-outline' as const) : ('person-outline' as const);
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Explore" component={ExploreNavigator} options={{ title: 'Explore' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ presentation: 'modal' }}
        />
        <RootStack.Screen name="MyRentals" component={MyRentalsScreen} />
        <RootStack.Screen name="MyListings" component={MyListingsScreen} />
        <RootStack.Screen name="Cart" component={CartScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
