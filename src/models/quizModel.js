import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const QUIZ_COLLECTION_NAME = 'Quizs'
const QUIZ_COLLECTION_SCHEMA = Joi.object({
  course_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  lesson_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  question: Joi.string().required(),
  options: Joi.array().items(Joi.string()).min(2).unique().required(),
  // answer: Joi.string().valid(Joi.ref('options')).required(),
  answer: Joi.string().required(),


  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

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

const deleteManyByLessonId = async (lessonid) => {
  try {
    const result = await GET_DB().collection(QUIZ_COLLECTION_NAME).deleteMany({
      lesson_id: new ObjectId(String(lessonid))
    })
    return result
  } catch (error) { throw new Error(error) }
}

export const quizModel = {
  QUIZ_COLLECTION_NAME,
  QUIZ_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  deleteManyByLessonId
}