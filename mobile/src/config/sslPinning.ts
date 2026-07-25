import Constants from 'expo-constants';

const isDev = Constants.expoConfig?.extra?.environment === 'development';

// Production certificate public key (SHA-256 base64)
// Replace with your actual server certificate fingerprint
const PRODUCTION_PIN = 'YOUR_SERVER_CERT_SHA256_BASE64';

export const sslPinningConfig = {
  enabled: !isDev,
  includeSubdomains: false,
  publicKeyHashes: [PRODUCTION_PIN],
};
