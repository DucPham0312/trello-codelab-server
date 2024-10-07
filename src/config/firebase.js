import { initializeApp, credential } from 'firebase-admin/app'
import { GET_DB } from '~/config/mongodb'
import { env } from '~/config/environment'

const serviceAccount = JSON.parse(env.FIREBASE_CONFIG)

const firebaseApp = initializeApp({
  credential: credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
})

console.log('Connected to Firebase successfully')

const db = GET_DB()

const fetchUsersFromFirebaseAndSaveToMongoDB = async () => {
  try {
    const users = await firebaseApp.auth().listUsers()
    console.log('Users from Firebase:', users)
    const result = await db.collection('users').insertMany(users)
    console.log(`Inserted ${result.insertedCount} users into the collection`)
  } catch (error) {
    console.error('Error fetching or inserting data:', error)
  }
}

(async () => {
  await fetchUsersFromFirebaseAndSaveToMongoDB()
})()

export { firebaseApp }