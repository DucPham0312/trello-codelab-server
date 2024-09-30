import { StatusCodes } from 'http-status-codes'
import { courseService } from '~/services/boardService'

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

const getDetails = async (req, res, next) => {
  try {
    // console.log('req.params: ', req.params)
    const boardId = req.params.id

    const board = await courseService.getDetails(boardId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}

export const courseController = {
  createNew,
  getDetails
}