import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { courseModel } from '~/models/courseModel'
import { reminderModel } from '~/models/reminderModel'
import { reviewModel } from '~/models/reviewModel'
import admin from '~/config/firebase'

//Define Collection (Name & schema)
const USER_COLLECTION_NAME = 'Users'
const USER_COLLECTION_SCHEMA = Joi.object({
  admin: Joi.boolean().required(),
  role: Joi.string().valid('admin', 'instructor', 'student').required(),
  user_status: Joi.boolean().required(),
  courses_status: Joi.array().items(Joi.object({
    course_id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
    progress_percentage: Joi.number().min(0).max(100).required(),
    completion_date: Joi.date().timestamp('javascript').default(null),
    certificate_issued: Joi.boolean().required()
  })),
  notification_status: Joi.array().items(Joi.object({
    notification_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.boolean().required()
  })),
  reminderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  reviewIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

//Chỉ định ra những field không cho phép trong hàm update()
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']


const getAllUsers = async () => {
  try {
    const users = []
    let nextPageToken
    const maxResults = 100 // Đặt giá trị maxResults

    do {
      const response = await admin.auth().listUsers(maxResults, nextPageToken)
      users.push(...response.users)
      nextPageToken = response.pageToken

      for (const user of response.users) {
        const userData = {
          userId: user.uid,
          data: user,
          favoriteListInfo: [],
          reminderIds: [],
          reviewIds: []
        }

        await GET_DB().collection(USER_COLLECTION_NAME).updateOne(
          { userId: user.uid },
          { $set: userData },
          { upsert: true }
        )
      }

    } while (nextPageToken)

    const usersData = await GET_DB().collection(USER_COLLECTION_NAME).find({}).toArray()
    return usersData
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) { throw new Error(error) }
}

//Querry tổng hợp (aggregate) để lấy toàn bộ collumn và card  thuộc Board
const getDetails = async (id) => {
  try {
    //tạm giống hệt hàm findOneById_ update aggregate sau
    const result = await GET_DB().collection(USER_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(String(id))
        // _destroy: false
      } },
      { $lookup: {
        from: courseModel.COURSE_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'user_Id',
        as: 'Courses'
      } },
      { $lookup: {
        from: reminderModel.REMINDER_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'user_Id',
        as: 'Reminders'
      } },
      { $lookup: {
        from: reviewModel.REVIEW_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'user_Id',
        as: 'Reviews'
      } }
    ]).toArray()
    return result[0] || {}
  } catch (error) { throw new Error(error) }
}


//Update User
const update = async (userId, updateData) => {
  try {
    //Lọc field không cho phép cập nhật
    Object.keys(updateData).forEach( fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    //Dữ liệu từ FE liên quan ObId xử lí
    // if (updateData.lesson_id) updateData.lesson_id = new ObjectId(String(updateData.lesson_id))

    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(userId)) },
      { $set: updateData },
      { returnDocument: 'after' } //Trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { throw new Error(error) }
}


const pushReminderIds = async (reminderId) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(reminderId.user_Id)) },
      { $push: { reminderIds: new ObjectId(String(reminderId._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

const pullReminderIds = async (reminderId) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(reminderId.user_Id)) },
      { $pull: { reminderIds: new ObjectId(String(reminderId._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

const pushReviewIds = async (reviewId) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(reviewId.user_Id)) },
      { $push: { reviewIds: new ObjectId(String(reviewId._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

const pullReviewIds = async (reviewId) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(reviewId.user_Id)) },
      { $pull: { reviewIds: new ObjectId(String(reviewId._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

const deleteManyByIds = async (userIds) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).deleteMany({
      _id: { $in: userIds.map(userId => new ObjectId(String(userId))) }
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  getAllUsers,
  findOneById,
  getDetails,
  update,
  pushReminderIds,
  pullReminderIds,
  pushReviewIds,
  pullReviewIds,
  deleteManyByIds
}
