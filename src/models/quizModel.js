import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const QUIZ_COLLECTION_NAME = 'Quizs'
const QUIZ_COLLECTION_SCHEMA = Joi.object({
  course_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  lesson_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  question: Joi.string().required().trim().strict(),
  options: Joi.array().items(Joi.string()).min(2).unique().required(),
  // answer: Joi.string().valid(Joi.ref('options')).required(),
  answer: Joi.string().required().trim().strict(),


  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'course_Id', 'lesson_id', 'createdAt']


const validateBeforeCreate = async (data) => {
  return await QUIZ_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newQuizToAdd = {
      ...validData,
      course_Id: new ObjectId(String(validData.course_Id)),
      lesson_id: new ObjectId(String(validData.lesson_id))

    }
    const createdQuiz = await GET_DB().collection(QUIZ_COLLECTION_NAME).insertOne(newQuizToAdd)
    return createdQuiz
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(QUIZ_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const getAllQuizs = async () => {
  try {
    const quizs = await GET_DB().collection(QUIZ_COLLECTION_NAME).find({}).toArray()

    return quizs
  } catch (error) { throw new Error(error) }
}

const getDetails = async (id) => {
  try {
    const result = await GET_DB().collection(QUIZ_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(String(id)),
        _destroy: false
      } }
    ]).toArray()

    return result[0] || {}
  } catch (error) { throw new Error(error) }
}

const deleteManyByLessonId = async (lessonid) => {
  try {
    const result = await GET_DB().collection(QUIZ_COLLECTION_NAME).deleteMany({
      lesson_id: new ObjectId(String(lessonid))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const deleteManyByCourseId = async (lessonid) => {
  try {
    const result = await GET_DB().collection(QUIZ_COLLECTION_NAME).deleteMany({
      course_Id: new ObjectId(String(lessonid))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const update = async (quizId, updateData) => {
  try {
    //Lọc field không cho phép cập nhật
    Object.keys(updateData).forEach( fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB().collection(QUIZ_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(quizId)) },
      { $set: updateData },
      { returnDocument: 'after' } //Trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async (quizid) => {
  try {
    const result = await GET_DB().collection(QUIZ_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(String(quizid))
    })
    return result
  } catch (error) { throw new Error(error) }
}

export const quizModel = {
  QUIZ_COLLECTION_NAME,
  QUIZ_COLLECTION_SCHEMA,
  createNew,
  getAllQuizs,
  findOneById,
  deleteManyByLessonId,
  deleteManyByCourseId,
  getDetails,
  update,
  deleteOneById
}