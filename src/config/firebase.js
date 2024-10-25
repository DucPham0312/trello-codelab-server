// import admin from 'firebase-admin'
// import serviceAccount from '~/firebaseconfig.json'

// let firebaseApp = null
// let firestoreInstance = null

// const connectFirebase = async () => {
//   if (!firebaseApp) {
//     firebaseApp = admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount)
//       // databaseURL: 'https://codelab-14068-default-rtdb.asia-southeast1.firebasedatabase.app/'
//     })
//     firestoreInstance = admin.firestore()
//   }
// }

// const firestore = () => {
//   if (!firestoreInstance) {
//     throw new Error('Connect to Firebase first!')
//   }
//   return firestoreInstance
// }

// export const CONNECT_FB = {
//   connectFirebase,
//   firestore
// }


import { env } from '~/config/environment'
import admin from 'firebase-admin'

// Tạo đối tượng thông tin tài khoản dịch vụ từ các biến môi trường
const serviceAccount = {
  projectId: env.PROJECT_ID,
  privateKey: env.PRIVATE_KEY.replace(/\\n/g, '\n'), // Thay thế newline
  clientEmail: env.CLIENT_EMAIL
}

// Khởi tạo Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    'https://codelab-14068-default-rtdb.asia-southeast1.firebasedatabase.app/' // Địa chỉ database Firebase của bạn
})

module.exports = admin // Xuất admin để sử dụng ở các module khác