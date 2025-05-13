import 'dotenv/config';

export default {
  expo: {
    name: 'your-app',
    slug: 'your-app',
    extra: {
      googleApiKey: process.env.GOOGLE_API_KEY,
    },
  },
};