import { StatusCodes } from 'http-status-codes'
import { blogService } from '~/services/blogService'

const createNew = async (req, res, next) => {
  try {
    const createdBlog = await blogService.creatNew(req.body)
    res.status(StatusCodes.CREATED).json(createdBlog)
  } catch (error) { next(error) }
}

const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await blogService.getAllBlogs()
    res.status(StatusCodes.OK).json(blogs)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const blogId = req.params.id
    const blog = await blogService.getDetails(blogId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(blog)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const blogId = req.params.id
    const updatedBlog = await blogService.update(blogId, req.body)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedBlog)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const blogId = req.params.id
    const result = await blogService.deleteItem(blogId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}


export const blogController = {
  createNew,
  getAllBlogs,
  getDetails,
  update,
  deleteItem
}