import { lessonModel } from '~/models/lessonModel'
import { courseModel } from '~/models/courseModel'
import { quizModel } from '~/models/quizModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'


const creatNew = async (reqBody) => {
  try {
    const newLesson = {
      ...reqBody
    }
    const createdLesson = await lessonModel.createNew(newLesson)
    const getNewLesson = await lessonModel.findOneById(createdLesson.insertedId)

    if (getNewLesson) {
      //xử lý cấu trúc data trước khi trả dữ liệu về
      getNewLesson.Quizs = []

      //Cập nhật mảng lessonIds trong Course
      await courseModel.pushLessonIds(getNewLesson)
    }

    return getNewLesson
  } catch (error) { throw error }
}

const getAllLessons = async () => {
  return await lessonModel.getAllLessons()
}

const getDetails = async (lessonId) => {
  try {
    const lesson = await lessonModel.getDetails(lessonId)
    if (!lesson) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found!')
    }

    return lesson
  } catch (error) { throw error }
}

const update = async (lessonId, reqBody, lessonCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedLesson = {}

    if (lessonCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(lessonCoverFile.buffer, 'lesson-covers')

      updatedLesson = await lessonModel.update(lessonId, {
        cover: uploadResult.secure_url
      })
    } else if (updateData.commentToAdd) {
      // Tạo dữ liệu comment để thêm vào database, cần bổ sung thêm những filed cần thiết
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }
      updatedLesson = await lessonModel.unshiftNewComment(lessonId, commentData)
    } else if (updateData.incomingMemberInfo) {
      //Trường hợp add hoặc remove member ra khỏi card
      updatedLesson = await lessonModel.updateMembers(lessonId, updateData.incomingMemberInfo)
    } else {
      //Các TH update thông tin chung
      updatedLesson = await lessonModel.update(lessonId, updateData)
    }

    return updatedLesson
  } catch (error) { throw error }
}

const deleteItem = async (lessonId) => {
  try {
    const targetLesson = await lessonModel.findOneById(lessonId)
    if (!targetLesson) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found!')
    }
    //Xoa lesson
    await lessonModel.deleteOneById(lessonId)

    //Xoa quizs of lesson
    await quizModel.deleteManyByLessonId(lessonId)

    //Delete lessonIds of Coures
    await courseModel.pullLessonIds(targetLesson)

    return { deleteResult: 'Delete successfully!' }
  } catch (error) { throw error }
}


export const lessonService = {
  creatNew,
  getAllLessons,
  getDetails,
  update,
  deleteItem
}