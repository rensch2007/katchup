// src/config.ts
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  web: 'https://www.katchup.club/api',
  ios: 'https://www.katchup.club/api',    // <--- your LAN IP manually here
  android: 'https://www.katchup.club/api', // same
});

export { BASE_URL };
