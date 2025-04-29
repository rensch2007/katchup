// src/config.ts
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  web: 'http://localhost:5001/api',
  ios: 'http://{UR_IP_ADDRESS}:5001/api',    // <--- your LAN IP manually here
  android: 'http://{UR_IP_ADDRESS}:5001/api', // same
});

export { BASE_URL };
