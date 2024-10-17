import { CONNECT_DB, GET_DB, CLOSE_DB } from '~/config/mongodb'
import { firebaseService } from '~/services/firebaseService'

const saveUsersToMongoDB = async (req, res) => {
  try {
    // Kết nối tới MongoDB
    await CONNECT_DB()

    // Lấy dữ liệu từ Firebase Firestore
    const dataUsers = await firebaseService.getAllUsersFromFirestore()

    // Lưu dữ liệu vào MongoDB
    const db = GET_DB()
    const usersCollection = db.collection('Users')
    await usersCollection.insertMany(dataUsers)

    res.status(200).json({ message: 'Data synced from Firestore to MongoDB successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  } finally {
    // Đóng kết nối MongoDB sau khi hoàn thành
    await CLOSE_DB()
  }
}

export const firebaseModel = {
  saveUsersToMongoDB
}