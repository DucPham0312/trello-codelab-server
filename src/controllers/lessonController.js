import { StatusCodes } from 'http-status-codes'
import { lessonService } from '~/services/lessonService'

const createNew = async (req, res, next) => {
  try {
    const createdLesson = await lessonService.creatNew(req.body)
    res.status(StatusCodes.CREATED).json(createdLesson)
  } catch (error) { next(error) }
}


export const lessonController = {
  createNew
}