import { blogModel } from '~/models/blogModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { contentModel } from '~/models/contentModel'


const creatNew = async (reqBody) => {
  try {
    const newBlog = {
      ...reqBody
    }
    const createdBlog = await blogModel.createNew(newBlog)
    const getNewBlog = await blogModel.findOneById(createdBlog.insertedId)

    return getNewBlog
  } catch (error) { throw error }
}

const getAllBlogs = async () => {
  return await blogModel.getAllBlogs()
}

const getDetails = async (blogId) => {
  try {
    const blog = await blogModel.getDetails(blogId)
    if (!blog) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Blog not found!')
    }

    return blog
  } catch (error) { throw error }
}

const update = async (blog_Id, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBlog = await blogModel.update(blog_Id, updateData)

    return updatedBlog
  } catch (error) { throw error }
}

const deleteItem = async (blog_Id) => {
  try {
    const targetBlog = await blogModel.findOneById(blog_Id)
    if (!targetBlog) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Blog not found!')
    }

    await blogModel.deleteOneById(blog_Id)

    await contentModel.deleteManyByBlogId(blog_Id)


    return { deleteResult: 'Delete successfully!' }
  } catch (error) { throw error }
}

export const blogService = {
  creatNew,
  getAllBlogs,
  getDetails,
  update,
  deleteItem
}