import 'dotenv/config';
import appJson from './app.json';

export default {
  ...appJson,
  expo: {
    ...appJson.expo,
    owner: "katchup",
    extra: {
      ...appJson.expo.extra,
      googleApiKey: process.env.GOOGLE_API_KEY,
      eas: {
        projectId: "b9a3d0a9-ac2d-4903-bc09-4a2638624ce4"
      }
    },
    updates: {
      url: "https://u.expo.dev/b9a3d0a9-ac2d-4903-bc09-4a2638624ce4"
    },
    runtimeVersion: {
      policy: "sdkVersion"
    },
    sdkVersion: "53.0.0"
  }
};
