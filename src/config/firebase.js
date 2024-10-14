import admin from 'firebase-admin'
import serviceAccount from '~/firebaseconfig.json'

let firebaseApp = null
let firestoreInstance = null

const connectFirebase = async () => {
  if (!firebaseApp) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
      // databaseURL: 'https://codelab-14068-default-rtdb.asia-southeast1.firebasedatabase.app/'
    })
    firestoreInstance = admin.firestore()
  }
}

const firestore = () => {
  if (!firestoreInstance) {
    throw new Error('Connect to Firebase first!')
  }
  return firestoreInstance
}

export const CONNECT_FB = {
  connectFirebase,
  firestore
}