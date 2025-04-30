// src/config.ts
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  web: 'http://www.katchup.club/api',
  ios: 'http://www.katchup.club/api',    // <--- your LAN IP manually here
  android: 'http://www.katchup.club/api', // same
});

export { BASE_URL };
