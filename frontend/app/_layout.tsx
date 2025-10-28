import { Stack } from "expo-router";

export type RootStackParamsList={
  Home:undefined;
  R21:undefined;
};
export default function RootLayout() {
  return <Stack screenOptions={{
    headerShown:false
  }}/>;
}
