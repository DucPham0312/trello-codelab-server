import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import admin from '~/config/firebase'

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


const deleteManyUsers = async (dataDelete) => {
  try {
    // const foundUsers = await Promise.all(dataDelete.map(userId => userModel.findOneById(userId)))
    // const notFoundUsers = dataDelete.filter((_, index) => !foundUsers[index])
    const foundUsers = []
    const notFoundUsers = []
    for (const userId of dataDelete) {
      const user = await userModel.findOneById(userId)
      if (user) {
        foundUsers.push(user)
      } else {
        notFoundUsers.push(userId)
      }
    }
    if (notFoundUsers.length > 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Users not found: ${notFoundUsers.join(', ')}`)
    }

    const uids = foundUsers.map(user => user.userId)

    await userModel.deleteManyByIds(dataDelete)
    const deleteFirebaseUsersResult = await admin.auth().deleteUsers(uids)

    if (deleteFirebaseUsersResult.failureCount > 0) {
      //failureCount:số người dùng ko bị xóa
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `There are ${deleteFirebaseUsersResult.failureCount} users that cannot be deleted from Firebase.`)
    }

    return { deleteResult: 'Delete successfully!' }
  } catch (error) {
    throw error
  }
}

export const userService = {
  getAllUsers,
  getDetails,
  update,
  deleteManyUsers
}