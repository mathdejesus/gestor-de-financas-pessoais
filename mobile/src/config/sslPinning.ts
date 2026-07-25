import Constants from 'expo-constants';

const isDev = Constants.expoConfig?.extra?.environment === 'development';

// Certificate file names (without .cer extension) stored in the app bundle
// Generate with: openssl x509 -in cert.pem -outform DER -out cert.cer
// Place .cer files in mobile/ios/ and mobile/android/app/src/main/res/raw/
const CERT_NAMES = ['financeapp-cert'];

export const sslPinningConfig = {
  enabled: !isDev,
  certs: CERT_NAMES,
};
