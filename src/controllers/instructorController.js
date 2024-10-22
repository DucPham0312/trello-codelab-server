import { StatusCodes } from 'http-status-codes'
import { instructorService } from '~/services/instructorService'

const createNew = async (req, res, next) => {
  try {
    const createdInstructor = await instructorService.creatNew(req.body)
    res.status(StatusCodes.CREATED).json(createdInstructor)
  } catch (error) { next(error) }
}

const getAllInstructors = async (req, res, next) => {
  try {
    const instructors = await instructorService.getAllInstructors()
    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(instructors)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    // console.log('req.params: ', req.params)
    const instructorId = req.params.id

    const instructor = await instructorService.getDetails(instructorId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(instructor)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const instructorId = req.params.id
    const updatedInstructor = await instructorService.update(instructorId, req.body)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedInstructor)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const instructorId = req.params.id
    const result = await instructorService.deleteItem(instructorId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const instructorController = {
  createNew,
  getAllInstructors,
  getDetails,
  update,
  deleteItem
}