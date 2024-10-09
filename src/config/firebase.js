import admin from 'firebase-admin'
import serviceAccount from '~/firebaseconfig.json'

const initializeFirebaseApp = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://codelab-14068-default-rtdb.asia-southeast1.firebasedatabase.app/'
  })
}

export const CONNECT_FB = {
  initializeFirebaseApp
}