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

const validateBeforeCreate = async (data) => {
  return await LESSON_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdCourse = await GET_DB().collection(LESSON_COLLECTION_NAME).insertOne(validData)
    return createdCourse
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(LESSON_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) { throw new Error(error) }
}

export const lessonModel = {
  LESSON_COLLECTION_NAME,
  LESSON_COLLECTION_SCHEMA,
  createNew,
  findOneById
}