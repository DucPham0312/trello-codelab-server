import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { COURSE_LEVEL } from '~/utils/variable'
import { lessonModel } from '~/models/lessonModel'
import { quizModel } from '~/models/quizModel'

//Define Collection (Name & schema)
const COURSE_COLLECTION_NAME = 'Courses'
const COURSE_COLLECTION_SCHEMA = Joi.object({
  course_name: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().optional().min(3).max(256).trim().strict(),
  author: Joi.string().required().min(3).max(50).trim().strict(),
  lessons: Joi.number().integer().min(5).required(),
  duration: Joi.number().integer().min(0).required(),
  level: Joi.string().valid(COURSE_LEVEL.LEVEL1, COURSE_LEVEL.LEVEL2, COURSE_LEVEL.LEVEL3).required(),
  language: Joi.string().required().trim().strict(),
  price: Joi.alternatives().try(
    Joi.string().valid('Free').required(),
    Joi.object({
      amount: Joi.number().required(),
      currency: Joi.string().required().trim().strict(),
      discount: Joi.object({
        percentage: Joi.number().required()
      })
    })
  ),
  star: Joi.number().integer().required(),
  catalog: Joi.string().required().trim().min(3).strict(),
  course_image: Joi.string().required().trim().strict(),
  completion_certificate: Joi.boolean().required(),
  enrollment_status: Joi.string().valid('Open', 'Closed').required(),
  memberIds: Joi.array().items(
    Joi.object().keys({
      memberId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      completed: Joi.number().integer().min(0).default(0)
    })
  ).default([]),
  instructorIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  lessonIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  revieweIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

//Chỉ định ra những field không cho phép trong hàm update()
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await COURSE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdCourse = await GET_DB().collection(COURSE_COLLECTION_NAME).insertOne(validData)
    return createdCourse
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) { throw new Error(error) }
}

//Querry tổng hợp (aggregate) để lấy toàn bộ collumn và card  thuộc Board
const getDetails = async (id) => {
  try {
    //tạm giống hệt hàm findOneById_ update aggregate sau
    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(String(id)),
        _destroy: false
      } },
      { $lookup: {
        from: lessonModel.LESSON_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'course_Id',
        as: 'Lessons'
      } },
      { $lookup: {
        from: quizModel.QUIZ_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'course_Id',
        as: 'Quizs'
      } }
    ]).toArray()

    return result[0] || {}
  } catch (error) { throw new Error(error) }
}

//Push lessonId vào cuối lessonIds
const pushLessonIds = async (lesson) => {
  try {
    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(lesson.course_Id)) },
      { $push: { lessonIds: new ObjectId(String(lesson._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

const pullLessonIds = async (lesson) => {
  try {
    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(lesson.course_Id)) },
      { $pull: { lessonIds: new ObjectId(String(lesson._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

//Update Course
const update = async (courseId, updateData) => {
  try {
    //Lọc field không cho phép cập nhật
    Object.keys(updateData).forEach( fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    //Dữ liệu từ FE liên quan ObId xử lí
    if (updateData.lesson_id) updateData.lesson_id = new ObjectId(String(updateData.lesson_id))

    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(courseId)) },
      { $set: updateData },
      { returnDocument: 'after' } //Trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async (courseId) => {
  try {
    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(String(courseId))
    })
    return result
  } catch (error) { throw new Error(error) }
}

export const courseModel = {
  COURSE_COLLECTION_NAME,
  COURSE_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushLessonIds,
  update,
  deleteOneById,
  pullLessonIds
}
