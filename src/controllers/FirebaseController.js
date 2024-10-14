// // import { firebaseService } from '~/services/firebaseService'
// import ApiError from '~/utils/ApiError'
// import { StatusCodes } from 'http-status-codes'
// import { firebaseModel } from '~/models/firebaseModel'


// const getAllUsersData = async (req, res) => {
//   try {
//     const allUserData = await firebaseModel.fetchAllUsersDataFromFirebase()
//     if (allUserData.length === 0) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'Users not found!')
//     }
//     res.json({ data: allUserData })
//   } catch (error) {
//     // Xử lý lỗi nếu cần
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message })
//   }
// }

// export const firebaseController = {
//   getAllUsersData
// }