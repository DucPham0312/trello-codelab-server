import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { quizModel } from '~/models/quizModel'


// Define Collection (name & schema)
const LESSON_COLLECTION_NAME = 'Lessons'
const LESSON_COLLECTION_SCHEMA = Joi.object({
  course_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  lesson_name: Joi.string().required().min(3).max(50).trim().strict(),
  lesson_duration: Joi.number().integer().min(0).required(),
  content: Joi.string().optional().trim().strict(),
  video_url: Joi.string().required().trim().strict(),
  rating: Joi.number().min(0).max(5).required(),
  resource_url: Joi.string().required().trim().strict(),
  quizIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  cover: Joi.string().default(null),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // Dữ liệu comments của Lesson sẽ nhúng - embedded vào bản ghi Lesson luôn:
  comments: Joi.array().items({
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    // Lưu ý vì dùng hàm $push để thêm comment nên không set default Date.now được.
    commentedAt: Joi.date().timestamp()
  }).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'course_Id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await LESSON_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newLessonToAdd = {
      ...validData,
      course_Id: new ObjectId(String(validData.course_Id))
    }
    const createdLesson = await GET_DB().collection(LESSON_COLLECTION_NAME).insertOne(newLessonToAdd)
    return createdLesson
  } catch (error) { throw new Error(error) }
}

const getAllLessons = async () => {
  try {
    const lessons = await GET_DB().collection(LESSON_COLLECTION_NAME).find({}).toArray()

    return lessons
  } catch (error) { throw new Error(error) }
}

const findOneById = async (lessonId) => {
  try {
    const result = await GET_DB().collection(LESSON_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(lessonId))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const getDetails = async (id) => {
  try {
    const result = await GET_DB().collection(LESSON_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(String(id)),
        _destroy: false
      } },
      { $lookup: {
        from: quizModel.QUIZ_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'lesson_id',
        as: 'Quizs'
      } }
    ]).toArray()

    return result[0] || {}
  } catch (error) { throw new Error(error) }
}

const pushQuizIds = async (quiz) => {
  try {
    const result = await GET_DB().collection(LESSON_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(quiz.lesson_id)) },
      { $push: { quizIds: new ObjectId(String(quiz._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

const update = async (lessonId, updateData) => {
  try {
    //Lọc field không cho phép cập nhật
    Object.keys(updateData).forEach( fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB().collection(LESSON_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(lessonId)) },
      { $set: updateData },
      { returnDocument: 'after' } //Trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async (lessonid) => {
  try {
    const result = await GET_DB().collection(LESSON_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(String(lessonid))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const deleteManyByCourseId = async (courseId) => {
  try {
    const result = await GET_DB().collection(LESSON_COLLECTION_NAME).deleteMany({
      course_Id: new ObjectId(String(courseId))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const pullQuizIds = async (quiz) => {
  try {
    const result = await GET_DB().collection(LESSON_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(quiz.lesson_id)) },
      { $pull: { quizIds: new ObjectId(String(quiz._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

/**
 * Đẩy một phần tử comment vào đầu mảng comments!
 * - Trong JS, ngược lại với push (thêm phần tử vào cuối mảng), unshift (thêm phần tử vào đầu mảng)
 * - Nhưng trong MongoDB hiện tại chỉ có $push --> cách để thêm phần tử vào đầu mảng:
 * * Vẫn dùng $push, nhưng bọc data vào Array ở trong $each và chỉ định $position: 0
 */
const unshiftNewComment = async (lessonId, commentData) => {
  try {
    const result = await GET_DB().collection(LESSON_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(lessonId)) },
      { $push: { comments: { $each: [commentData], $position: 0 } } },
      { returnDocument: 'after' }
    )

    return result
  } catch (error) {
    throw new Error(error)
  }
}


export const lessonModel = {
  LESSON_COLLECTION_NAME,
  LESSON_COLLECTION_SCHEMA,
  createNew,
  getAllLessons,
  findOneById,
  getDetails,
  pushQuizIds,
  update,
  deleteOneById,
  deleteManyByCourseId,
  pullQuizIds,
  unshiftNewComment
}