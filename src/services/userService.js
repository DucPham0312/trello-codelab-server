import { userModel } from '~/models/userModel'
import { courseModel } from '~/models/courseModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// const creatNew = async (reqBody) => {
//   try {
//     const newUser = {
//       ...reqBody
//     }
//     const createdUser = await userModel.createNew(newUser)
//     const getNewUser = await userModel.findOneById(createdUser.insertedId)

//     if (getNewUser) {
//       await courseModel.pushUserIds(getNewUser)
//     }

//     return getNewUser
//   } catch (error) { throw error }
// }

const getAllUsers = async () => {
  return await userModel.getAllUsers()
}

const getDetails = async (userId) => {
  try {
    const user = await userModel.getDetails(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
    }

    return user
  } catch (error) { throw error }
}

const update = async (user_Id, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedUser = await userModel.update(user_Id, updateData)

    return updatedUser
  } catch (error) { throw error }
}

const deleteItem = async (user_Id) => {
  try {
    const targetUser = await userModel.findOneById(user_Id)
    if (!targetUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
    }
    //Xoa user
    await userModel.deleteOneById(user_Id)
    await courseModel.pullMemberIds(targetUser)

    return { deleteResult: 'Delete successfully!' }
  } catch (error) { throw error }
}


export const userService = {
  getAllUsers,
  getDetails,
  update,
  deleteItem
}