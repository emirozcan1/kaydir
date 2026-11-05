import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.reversearcade.game",
  appName: "Reverse Arcade",
  webDir: "dist",
  server: {
    // Keep the production app fully local/offline; do not point to the dev server.
    androidScheme: "https",
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#0B0F19",
  },
};

export default config;
