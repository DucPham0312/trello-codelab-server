import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { courseModel } from '~/models/courseModel'


// Define Collection (name & schema)
const INSTRUCTOR_COLLECTION_NAME = 'Instructors'
const INSTRUCTOR_COLLECTION_SCHEMA = Joi.object({
  instructor_name: Joi.string().required().min(3).max(50).trim().strict(),
  bio: Joi.string().required().min(3).max(255).trim().strict(),
  experience: Joi.number().required(),
  profile_image: Joi.string().required().trim().strict(),
  contact_info: Joi.object({
    email: Joi.string().email().required(),
    social_links: Joi.array().items(Joi.string()).required()
  }),
  courseIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await INSTRUCTOR_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdInstructor = await GET_DB().collection(INSTRUCTOR_COLLECTION_NAME).insertOne(validData)
    return createdInstructor
  } catch (error) { throw new Error(error) }
}

const getAllInstructors = async () => {
  try {
    const instructors = await GET_DB().collection(INSTRUCTOR_COLLECTION_NAME).find({}).toArray()

    return instructors
  } catch (error) { throw new Error(error) }
}

const findOneById = async (instructorId) => {
  try {
    const result = await GET_DB().collection(INSTRUCTOR_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(instructorId))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const getDetails = async (id) => {
  try {
    const result = await GET_DB().collection(INSTRUCTOR_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(String(id)),
        _destroy: false
      } },
      { $lookup: {
        from: courseModel.COURSE_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'instructor_Id',
        as: 'Courses'
      } }
    ]).toArray()

    return result[0] || {}
  } catch (error) { throw new Error(error) }
}

const pushCourseIds = async (course) => {
  try {
    const result = await GET_DB().collection(INSTRUCTOR_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(course.instructor_Id)) },
      { $push: { courseIds: new ObjectId(String(course._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

const pullCourseIds = async (course) => {
  try {
    const result = await GET_DB().collection(INSTRUCTOR_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(course.instructor_Id)) },
      { $pull: { courseIds: new ObjectId(String(course._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

const update = async (instructorId, updateData) => {
  try {
    //Lọc field không cho phép cập nhật
    Object.keys(updateData).forEach( fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB().collection(INSTRUCTOR_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(instructorId)) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async (instructorid) => {
  try {
    const result = await GET_DB().collection(INSTRUCTOR_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(String(instructorid))
    })
    return result
  } catch (error) { throw new Error(error) }
}

export const instructorModel = {
  INSTRUCTOR_COLLECTION_NAME,
  INSTRUCTOR_COLLECTION_SCHEMA,
  createNew,
  getAllInstructors,
  findOneById,
  getDetails,
  pushCourseIds,
  update,
  deleteOneById,
  pullCourseIds
}