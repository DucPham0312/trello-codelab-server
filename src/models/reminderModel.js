import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


// Define Collection (name & schema)
const REMINDER_COLLECTION_NAME = 'Reminders'
const REMINDER_COLLECTION_SCHEMA = Joi.object({
  user_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  event_type: Joi.string().required().min(3).max(50).trim().strict(),
  event_id: Joi.alternatives().try(
    Joi.object({
      course_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    }),
    Joi.object({
      lesson_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    }),
    Joi.object({
      quiz_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })
  ),
  message: Joi.string().required().trim().strict(),
  status: Joi.string().valid('Pending', 'Sent', 'Failed').required(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'user_Id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await REMINDER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newReminderToAdd = {
      ...validData,
      user_Id: new ObjectId(String(validData.user_Id))
    }
    const createdReminder = await GET_DB().collection(REMINDER_COLLECTION_NAME).insertOne(newReminderToAdd)
    return createdReminder
  } catch (error) { throw new Error(error) }
}

const getAllReminders = async () => {
  try {
    const reminders = await GET_DB().collection(REMINDER_COLLECTION_NAME).find({}).toArray()

    return reminders
  } catch (error) { throw new Error(error) }
}

const findOneById = async (reminderId) => {
  try {
    const result = await GET_DB().collection(REMINDER_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(reminderId))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const getDetails = async (id) => {
  try {
    const result = await GET_DB().collection(REMINDER_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(String(id)),
        _destroy: false
      } }
    ]).toArray()

    return result[0] || {}
  } catch (error) { throw new Error(error) }
}


const update = async (reminderId, updateData) => {
  try {
    //Lọc field không cho phép cập nhật
    Object.keys(updateData).forEach( fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB().collection(REMINDER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(reminderId)) },
      { $set: updateData },
      { returnDocument: 'after' } //Trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async (reminderid) => {
  try {
    const result = await GET_DB().collection(REMINDER_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(String(reminderid))
    })
    return result
  } catch (error) { throw new Error(error) }
}

export const reminderModel = {
  REMINDER_COLLECTION_NAME,
  REMINDER_COLLECTION_SCHEMA,
  createNew,
  getAllReminders,
  findOneById,
  getDetails,
  update,
  deleteOneById
}