import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


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
    const newColumnToAdd = {
      ...validData,
      course_Id: new ObjectId(String(validData.course_Id))
    }
    const createdLesson = await GET_DB().collection(LESSON_COLLECTION_NAME).insertOne(newColumnToAdd)
    return createdLesson
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

    //Dữ liệu từ FE liên quan ObId xử lí
    if (updateData.lesson_id) updateData.lesson_id = new ObjectId(String(updateData.lesson_id))

    const result = await GET_DB().collection(LESSON_COLLECTION_SCHEMA).findOneAndUpdate(
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

export const lessonModel = {
  LESSON_COLLECTION_NAME,
  LESSON_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushQuizIds,
  update,
  deleteOneById,
  deleteManyByCourseId
}