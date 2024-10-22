import { instructorModel } from '~/models/instructorModel'
import { courseModel } from '~/models/courseModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const creatNew = async (reqBody) => {
  try {
    const newInstructor = {
      ...reqBody
    }
    const createdInstructor = await instructorModel.createNew(newInstructor)
    const getNewInstructor = await instructorModel.findOneById(createdInstructor.insertedId)

    if (getNewInstructor) {
      //xử lý cấu trúc data trước khi trả dữ liệu về
      getNewInstructor.Courses = []
    }
    return getNewInstructor
  } catch (error) { throw error }
}

const getAllInstructors = async () => {
  return await instructorModel.getAllInstructors()
}

const getDetails = async (instructorId) => {
  try {
    const instructor = await instructorModel.getDetails(instructorId)
    if (!instructor) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Instructor not found!')
    }

    return instructor
  } catch (error) { throw error }
}

const update = async (instructor_Id, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedInstructor = await instructorModel.update(instructor_Id, updateData)

    return updatedInstructor
  } catch (error) { throw error }
}

const deleteItem = async (instructor_Id) => {
  try {
    const targetInstructor = await instructorModel.findOneById(instructor_Id)
    if (!targetInstructor) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Instructor not found!')
    }
    //Xoa instructor
    await instructorModel.deleteOneById(instructor_Id)

    await courseModel.deleteManyByInstructorId(instructor_Id)

    return { deleteResult: 'Delete successfully!' }
  } catch (error) { throw error }
}


export const instructorService = {
  creatNew,
  getAllInstructors,
  getDetails,
  update,
  deleteItem
}