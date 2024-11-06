import { StatusCodes } from 'http-status-codes'
import { lessonService } from '~/services/lessonService'

const createNew = async (req, res, next) => {
  try {
    const createdLesson = await lessonService.creatNew(req.body)
    res.status(StatusCodes.CREATED).json(createdLesson)
  } catch (error) { next(error) }
}

const getAllLessons = async (req, res, next) => {
  try {
    const lessons = await lessonService.getAllLessons()
    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(lessons)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    // console.log('req.params: ', req.params)
    const lessonId = req.params.id

    const lesson = await lessonService.getDetails(lessonId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(lesson)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const lessonId = req.params.id
    const lessonCoverFile = req.file
    const userInfo = req.jwtDecoded
    const updatedLesson = await lessonService.update(lessonId, req.body, lessonCoverFile, userInfo)

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
  getAllLessons,
  getDetails,
  update,
  deleteItem
}