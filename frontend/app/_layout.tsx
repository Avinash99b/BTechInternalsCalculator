import "../polyfills.node"
import { Stack } from "expo-router";
import { useEffect } from "react";

import { getCredentials } from "./utils/storage";
import { login as apiLogin, getMidMarks } from "./utils/vignanApiClass";
import { getSelectedSemester, getSelectedMid } from "./utils/storage";
export type RootStackParamsList = {
  Home: undefined;
  R21: undefined;
};

export default function RootLayout() {
  // Prefetch marks on app start so VignanPage can show data immediately
  useEffect(() => {
    let mounted = true;
    async function prefetch() {
      try {
        const creds = await getCredentials();
        if (!creds) return;

        // Attempt to re-login to restore session cookie in api client
        const ok = await apiLogin(creds).catch(() => false);
        if (!ok) return;

        const sem = (await getSelectedSemester()) ?? "1";
        const mid = (await getSelectedMid()) ?? "1";

        // Warm the API cache / session by fetching marks once in background
        await getMidMarks(sem, mid).catch(() => null);
      } catch (err) {
        // ignore, background prefetch should not crash the app
        console.debug("Prefetch failed:", err);
      }
    }

    if (mounted) prefetch();
    return () => {
      mounted = false;
    };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
