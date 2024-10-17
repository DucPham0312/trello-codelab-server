import { quizModel } from '~/models/quizModel'
import { lessonModel } from '~/models/lessonModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'


const creatNew = async (reqBody) => {
  try {
    const newQuiz = {
      ...reqBody
    }
    const createdQuiz = await quizModel.createNew(newQuiz)
    const getNewQuiz = await quizModel.findOneById(createdQuiz.insertedId)

    if (getNewQuiz) {
      await lessonModel.pushQuizIds(getNewQuiz)
    }

    return getNewQuiz
  } catch (error) { throw error }
}

export const quizService = {
  creatNew
}