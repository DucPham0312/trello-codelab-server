import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

// Define Collection (name & schema)
const NOTIFICATION_COLLECTION_NAME = 'Notifications'
const NOTIFICATION_COLLECTION_SCHEMA = Joi.object({
  messages: Joi.string().required().trim().strict(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']


const validateBeforeCreate = async (data) => {
  return await NOTIFICATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdNotification = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).insertOne(validData)
    return createdNotification
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const getAllNotifications = async () => {
  try {
    const notifications = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).find({}).toArray()

    return notifications
  } catch (error) { throw new Error(error) }
}

const getDetails = async (id) => {
  try {
    const result = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(String(id)),
        _destroy: false
      } }
    ]).toArray()

    return result[0] || {}
  } catch (error) { throw new Error(error) }
}

const update = async (notificationId, updateData) => {
  try {
    //Lọc field không cho phép cập nhật
    Object.keys(updateData).forEach( fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(notificationId)) },
      { $set: updateData },
      { returnDocument: 'after' } //Trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async (notificationid) => {
  try {
    const result = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(String(notificationid))
    })
    return result
  } catch (error) { throw new Error(error) }
}

export const notificationModel = {
  NOTIFICATION_COLLECTION_NAME,
  NOTIFICATION_COLLECTION_SCHEMA,
  createNew,
  getAllNotifications,
  findOneById,
  getDetails,
  update,
  deleteOneById
}