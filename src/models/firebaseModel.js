import Joi from 'joi'
import { GET_DB } from '~/config/db'
import { firebaseService } from '~/services/firebaseService'

const USER_COLLECTION_NAME = 'Users'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().email().required().regex(/@gmail.com$/),
  firstname: Joi.string().min(2).max(20).required(),
  lastname: Joi.string().required().min(2).max(20),
  provider: Joi.string().required(),
  registered: Joi.boolean().default(false),
  created: Joi.date().default(() => new Date(), 'current date'),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const saveUsersToMongoDB = async (usersData) => {
  try {
    const validData = await validateBeforeCreate(usersData)

    const result = await GET_DB().collection(USER_COLLECTION_NAME).insertMany(validData)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const saveUsersFromFirebaseToMongoDB = async () => {
  try {
    const usersFromFirebase = await firebaseService.getAllUsersFromFirestore() // Sử dụng hàm lấy dữ liệu từ Firebase
    const result = await saveUsersToMongoDB(usersFromFirebase)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const firebaseModel = {
  saveUsersToMongoDB,
  saveUsersFromFirebaseToMongoDB
}