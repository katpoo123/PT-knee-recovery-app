import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import KneeRehab from "./src/KneeRehab";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <KneeRehab />
    </SafeAreaProvider>
  );
}
