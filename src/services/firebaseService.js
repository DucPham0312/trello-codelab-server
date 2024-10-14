import { CONNECT_FB } from '~/config/firebase'

const getAllUsersFromFirestore = async () => {
  try {
    const userRef = await CONNECT_FB.firestore().collection('users')
    const response = await userRef.get()
    let dataUsers = []
    response.forEach(doc => {
      dataUsers.push({ id: doc.id, ...doc.data() })
    })
    return dataUsers
  } catch (error) {
    throw new Error(error)
  }
}

export const firebaseService = {
  getAllUsersFromFirestore
}