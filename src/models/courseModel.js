import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { COURSE_LEVEL } from '~/utils/variable'

//Define Collection (Name & schema)
const COURSE_COLLECTION_NAME = 'Courses'
const COURSE_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().optional().min(3).max(256).trim().strict(),
  author: Joi.string().required().min(3).max(50).trim().strict(),
  catalog: Joi.string().required().trim().min(3).strict(),
  level: Joi.string().valid(COURSE_LEVEL.LEVEL1, COURSE_LEVEL.LEVEL2, COURSE_LEVEL.LEVEL3).required(),
  lessons: Joi.number().integer().min(10).required(),
  duration: Joi.object({
    hours: Joi.number().integer().min(0).required(),
    minutes: Joi.number().integer().min(0).max(59).required()
  }),
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
    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) { throw new Error(error) }
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
  update,
  deleteOneById
}
