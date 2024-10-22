import { contentModel } from '~/models/contentModel'
import { blogModel } from '~/models/blogModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const creatNew = async (reqBody) => {
  try {
    const newContent = {
      ...reqBody
    }
    const createdContent = await contentModel.createNew(newContent)
    const getNewContent = await contentModel.findOneById(createdContent.insertedId)

    if (getNewContent) {
      await blogModel.pushContentIds(getNewContent)
    }

    return getNewContent
  } catch (error) { throw error }
}

const getAllContents = async () => {
  return await contentModel.getAllContents()
}

const getDetails = async (contentId) => {
  try {
    const content = await contentModel.getDetails(contentId)
    if (!content) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Content not found!')
    }

    return content
  } catch (error) { throw error }
}

const update = async (content_Id, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedContent = await contentModel.update(content_Id, updateData)

    return updatedContent
  } catch (error) { throw error }
}

const deleteItem = async (content_Id) => {
  try {
    const targetContent = await contentModel.findOneById(content_Id)
    if (!targetContent) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Content not found!')
    }
    //Xoa content
    await contentModel.deleteOneById(content_Id)

    await blogModel.pullContentIds(targetContent)

    return { deleteResult: 'Delete successfully!' }
  } catch (error) { throw error }
}


export const contentService = {
  creatNew,
  getAllContents,
  getDetails,
  update,
  deleteItem
}