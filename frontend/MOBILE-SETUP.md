# Reverse Arcade — iPhone build notes

This project is prepared to be wrapped with Capacitor. The game remains a local web bundle inside the iOS app; it does not need a server to run.

## Build the web bundle on Windows

From this `frontend` directory:

```powershell
npm.cmd install
npm.cmd run build
```

## Create the iOS project (requires a Mac with Xcode)

After dependencies are installed:

```bash
npx cap add ios
npm run build
npx cap sync ios
npx cap open ios
```

In Xcode, sign in with your Apple Account, select your iPhone as the run destination, choose your Personal Team under Signing & Capabilities, then press Run. A free Personal Team provisioning profile expires after 7 days, so the app must be re-signed/reinstalled periodically.

## Notes

- iOS builds cannot be produced directly on Windows: Apple requires macOS and Xcode.
- The native wrapper does not automatically fix performance; this version also adds safe-area handling, disables expensive backdrop blur/ambient motion on touch-first devices, and avoids rewriting the timer color on every animation frame.
- Do not commit `.env` files or signing credentials.
