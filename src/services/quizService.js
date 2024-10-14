import { slugify } from '~/utils/formatters'
import { quizModel } from '~/models/quizModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'


const creatNew = async (reqBody) => {
  try {
    const newQuiz = {
      ...reqBody
    }
    const createdQuiz = await quizModel.createNew(newQuiz)
    const getNewQuiz = await quizModel.findOneById(createdQuiz.insertedId)

    //...

    return getNewQuiz
  } catch (error) { throw error }
}

export const quizService = {
  creatNew
}