import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type ExploreStackParamList = {
  Home: undefined;
  ListingDetail: { listingId: string };
  BookingRequest: { listingId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Explore: NavigatorScreenParams<ExploreStackParamList>;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MyRentals: undefined;
  MyListings: undefined;
};

export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'Home'>,
  BottomTabScreenProps<MainTabParamList>
>;

export type ListingDetailScreenProps = NativeStackScreenProps<ExploreStackParamList, 'ListingDetail'>;

export type BookingRequestScreenProps = NativeStackScreenProps<
  ExploreStackParamList,
  'BookingRequest'
>;

export type MyRentalsScreenProps = NativeStackScreenProps<RootStackParamList, 'MyRentals'>;
export type MyListingsScreenProps = NativeStackScreenProps<RootStackParamList, 'MyListings'>;

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
