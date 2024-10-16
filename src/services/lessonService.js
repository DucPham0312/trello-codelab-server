import { slugify } from '~/utils/formatters'
import { lessonModel } from '~/models/lessonModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { courseModel } from '~/models/courseModel'

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

const update = async (lesson_Id, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedLesson = await lessonModel.update(lesson_Id, updateData)

    return updatedLesson
  } catch (error) { throw error }
}

export const lessonService = {
  creatNew,
  update
}