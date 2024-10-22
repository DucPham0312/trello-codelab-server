import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


// Define Collection (name & schema)
const REVIEW_COLLECTION_NAME = 'Reviews'
const REVIEW_COLLECTION_SCHEMA = Joi.object({
  user_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  comment_id: Joi.alternatives().try(
    Joi.object({
      course_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    }),
    Joi.object({
      lesson_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    }),
    Joi.object({
      quiz_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    }),
    Joi.object({
      blog_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })
  ),
  rating: Joi.number().optional(),
  comment: Joi.string().required().trim().strict(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'user_Id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await REVIEW_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newReviewToAdd = {
      ...validData,
      user_Id: new ObjectId(String(validData.user_Id))
    }
    const createdReview = await GET_DB().collection(REVIEW_COLLECTION_NAME).insertOne(newReviewToAdd)
    return createdReview
  } catch (error) { throw new Error(error) }
}

const getAllReviews = async () => {
  try {
    const reviews = await GET_DB().collection(REVIEW_COLLECTION_NAME).find({}).toArray()

    return reviews
  } catch (error) { throw new Error(error) }
}

const findOneById = async (reviewId) => {
  try {
    const result = await GET_DB().collection(REVIEW_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(reviewId))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const getDetails = async (id) => {
  try {
    const result = await GET_DB().collection(REVIEW_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(String(id)),
        _destroy: false
      } }
    ]).toArray()

    return result[0] || {}
  } catch (error) { throw new Error(error) }
}


const update = async (reviewId, updateData) => {
  try {
    //Lọc field không cho phép cập nhật
    Object.keys(updateData).forEach( fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB().collection(REVIEW_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(reviewId)) },
      { $set: updateData },
      { returnDocument: 'after' } //Trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async (reviewid) => {
  try {
    const result = await GET_DB().collection(REVIEW_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(String(reviewid))
    })
    return result
  } catch (error) { throw new Error(error) }
}


export const reviewModel = {
  REVIEW_COLLECTION_NAME,
  REVIEW_COLLECTION_SCHEMA,
  createNew,
  getAllReviews,
  findOneById,
  getDetails,
  update,
  deleteOneById
}