import { StatusCodes } from 'http-status-codes'
import { courseService } from '~/services/courseService'

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body: ', req.body)
    // console.log('req.query: ', req.query)
    // console.log('req.params: ', req.params)

    //Điều hướng dữ liệu qua tầng Service
    const createdCourse = await courseService.creatNew(req.body)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.CREATED).json(createdCourse)
  } catch (error) { next(error) }
}

const getAllCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getAllCourses()
    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(courses)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    // console.log('req.params: ', req.params)
    const courseId = req.params.id

    const course = await courseService.getDetails(courseId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(course)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const courseId = req.params.id
    const updatedCourse = await courseService.update(courseId, req.body)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedCourse)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const courseId = req.params.id
    const result = await courseService.deleteItem(courseId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const courseController = {
  createNew,
  getAllCourses,
  getDetails,
  update,
  deleteItem
}