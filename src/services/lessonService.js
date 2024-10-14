import { slugify } from '~/utils/formatters'
import { lessonModel } from '~/models/lessonModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'


const creatNew = async (reqBody) => {
  try {
    const newLesson = {
      ...reqBody
    }
    const createdLesson = await lessonModel.createNew(newLesson)
    const getNewLesson = await lessonModel.findOneById(createdLesson.insertedId)

    //...

    return getNewLesson
  } catch (error) { throw error }
}

export const lessonService = {
  creatNew
}