// import db from '~/config/firebase'

// const fetchAllUsersDataFromFirebase = async (req, res) => {
//   try {
//     const snapshot = await db.firestore().collection('Users').get()
//     if (snapshot.empty) {
//       throw new Error('Collection "Users" does not exist or is empty')
//     }

//     const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
//     res.send(list)
//   } catch (error) {
//     throw new Error(`Error fetching data from collection: ${error.message}`)
//   }
// }

// export const firebaseModel = {
//   fetchAllUsersDataFromFirebase
// }