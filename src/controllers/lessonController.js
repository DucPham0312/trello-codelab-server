import { StatusCodes } from 'http-status-codes'
import { lessonService } from '~/services/lessonService'

const createNew = async (req, res, next) => {
  try {
    const createdLesson = await lessonService.creatNew(req.body)
    res.status(StatusCodes.CREATED).json(createdLesson)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const lessonId = req.params.id
    const updatedLesson = await lessonService.update(lessonId, req.body)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedLesson)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const lessonId = req.params.id
    const result = await lessonService.deleteItem(lessonId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const lessonController = {
  createNew,
  update,
  deleteItem
}