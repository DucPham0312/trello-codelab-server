import { StatusCodes } from 'http-status-codes'
import { courseService } from '~/services/courseService'

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body: ', req.body)
    // console.log('req.query: ', req.query)
    // console.log('req.params: ', req.params)
    const userId = req.jwtDecoded._id

    //Điều hướng dữ liệu qua tầng Service
    const createdCourse = await courseService.creatNew(userId, req.body)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.CREATED).json(createdCourse)
  } catch (error) { next(error) }
}

const getAllCourses = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    //page và itemsPerPage được truyền vào trong query url từ phía FE nên BE lấy thông qua req.query
    const { page, itemsPerPage } = req.query
    const results = await courseService.getAllCourses(userId, page, itemsPerPage)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(results)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const courseId = req.params.id

    const course = await courseService.getDetails(userId, courseId)

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