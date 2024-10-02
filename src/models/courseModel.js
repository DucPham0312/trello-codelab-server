import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

//Define Collection (Name & schema)
const COURSE_COLLECTION_NAME = 'Courses'
const COURSE_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().optional().min(3).max(256).trim().strict(),
  author: Joi.string().required().min(3).max(50).trim().strict(),
  level: Joi.string().valid('Basic', 'Intermediate', 'Advanced').required(),
  lessons: Joi.number().integer().min(10).required(),
  price: Joi.alternatives().try(
    Joi.number().min(0).required(),
    Joi.string().valid('Free').required()
  ),
  memberIds: Joi.array().items(
    Joi.object().keys({
      memberId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      completed: Joi.number().integer().min(0).default(0)
    })
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

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
    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) { throw new Error(error) }
}

export const courseModel = {
  COURSE_COLLECTION_NAME,
  COURSE_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails
}
