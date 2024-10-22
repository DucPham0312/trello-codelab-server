import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { contentModel } from '~/models/contentModel'


// Define Collection (name & schema)
const BLOG_COLLECTION_NAME = 'Blogs'
const BLOG_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().trim().strict(),
  views: Joi.number().integer().required(),
  likes: Joi.number().integer().required(),
  revieweIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  contentIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']


const validateBeforeCreate = async (data) => {
  return await BLOG_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdBlog = await GET_DB().collection(BLOG_COLLECTION_NAME).insertOne(validData)
    return createdBlog
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(BLOG_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const getAllBlogs = async () => {
  try {
    const blogs = await GET_DB().collection(BLOG_COLLECTION_NAME).find({}).toArray()

    return blogs
  } catch (error) { throw new Error(error) }
}

const getDetails = async (id) => {
  try {
    const result = await GET_DB().collection(BLOG_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(String(id)),
        _destroy: false
      } },
      { $lookup: {
        from: contentModel.CONTENT_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'blog_Id',
        as: 'Contents'
      } }
    ]).toArray()

    return result[0] || {}
  } catch (error) { throw new Error(error) }
}

const update = async (blogId, updateData) => {
  try {
    //Lọc field không cho phép cập nhật
    Object.keys(updateData).forEach( fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB().collection(BLOG_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(blogId)) },
      { $set: updateData },
      { returnDocument: 'after' } //Trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async (blogid) => {
  try {
    const result = await GET_DB().collection(BLOG_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(String(blogid))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const pushContentIds = async (content) => {
  try {
    const result = await GET_DB().collection(BLOG_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(content.blog_Id)) },
      { $push: { contentIds: new ObjectId(String(content._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

const pullContentIds = async (content) => {
  try {
    const result = await GET_DB().collection(BLOG_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(content.blog_Id)) },
      { $pull: { contentIds: new ObjectId(String(content._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

export const blogModel = {
  BLOG_COLLECTION_NAME,
  BLOG_COLLECTION_SCHEMA,
  createNew,
  getAllBlogs,
  findOneById,
  getDetails,
  update,
  deleteOneById,
  pushContentIds,
  pullContentIds
}