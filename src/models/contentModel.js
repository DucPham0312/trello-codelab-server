import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


// Define Collection (name & schema)
const CONTENT_COLLECTION_NAME = 'Contents'
const CONTENT_COLLECTION_SCHEMA = Joi.object({
  blog_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().trim().strict(),
  urlImg: Joi.string().required().trim().strict(),
  descImg: Joi.string().required().trim().strict(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'blog_Id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await CONTENT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newContentToAdd = {
      ...validData,
      blog_Id: new ObjectId(String(validData.blog_Id))
    }
    const createdContent = await GET_DB().collection(CONTENT_COLLECTION_NAME).insertOne(newContentToAdd)
    return createdContent
  } catch (error) { throw new Error(error) }
}

const getAllContents = async () => {
  try {
    const contents = await GET_DB().collection(CONTENT_COLLECTION_NAME).find({}).toArray()

    return contents
  } catch (error) { throw new Error(error) }
}

const findOneById = async (contentId) => {
  try {
    const result = await GET_DB().collection(CONTENT_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(contentId))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const getDetails = async (id) => {
  try {
    const result = await GET_DB().collection(CONTENT_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(String(id)),
        _destroy: false
      } }
    ]).toArray()

    return result[0] || {}
  } catch (error) { throw new Error(error) }
}


const update = async (contentId, updateData) => {
  try {
    //Lọc field không cho phép cập nhật
    Object.keys(updateData).forEach( fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB().collection(CONTENT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(contentId)) },
      { $set: updateData },
      { returnDocument: 'after' } //Trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async (contentid) => {
  try {
    const result = await GET_DB().collection(CONTENT_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(String(contentid))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const deleteManyByBlogId = async (blogId) => {
  try {
    const result = await GET_DB().collection(CONTENT_COLLECTION_NAME).deleteMany({
      blog_Id: new ObjectId(String(blogId))
    })
    return result
  } catch (error) { throw new Error(error) }
}

export const contentModel = {
  CONTENT_COLLECTION_NAME,
  CONTENT_COLLECTION_SCHEMA,
  createNew,
  getAllContents,
  findOneById,
  getDetails,
  update,
  deleteOneById,
  deleteManyByBlogId
}