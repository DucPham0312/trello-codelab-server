import { StatusCodes } from 'http-status-codes'
import { contentService } from '~/services/contentService'

const createNew = async (req, res, next) => {
  try {
    const createdContent = await contentService.creatNew(req.body)
    res.status(StatusCodes.CREATED).json(createdContent)
  } catch (error) { next(error) }
}

const getAllContents = async (req, res, next) => {
  try {
    const contents = await contentService.getAllContents()
    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(contents)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const contentId = req.params.id

    const content = await contentService.getDetails(contentId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(content)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const contentId = req.params.id
    const updatedContent = await contentService.update(contentId, req.body)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedContent)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const contentId = req.params.id
    const result = await contentService.deleteItem(contentId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const contentController = {
  createNew,
  getAllContents,
  getDetails,
  update,
  deleteItem
}