import 'dotenv/config'

export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,

  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,

  BUILD_MODE: process.env.BUILD_MODE,

  AUTHOR: process.env.AUTHOR,

  // APIKEY: process.env.APIKEY,
  // AUTHDOMAIN: process.env.AUTHDOMAIN,
  // PROJECTID: process.env.PROJECTID,
  // STORAGEBUCKET: process.env.STORAGEBUCKET,
  // MESSAGINGSENDERID: process.env.MESSAGINGSENDERID,
  // APPID: process.env.APPID,
  // MEASUREMENTID: process.env.MEASUREMENTID


  FIREBASE_CONFIG: process.env.FIREBASE_CONFIG
}
