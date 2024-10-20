import { quizModel } from '~/models/quizModel'
import { lessonModel } from '~/models/lessonModel'
import { courseModel } from '~/models/courseModel'
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

const getAllQuizs = async () => {
  return await quizModel.getAllQuizs()
}

const getDetails = async (quizId) => {
  try {
    const quiz = await quizModel.getDetails(quizId)
    if (!quiz) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz not found!')
    }

    return quiz
  } catch (error) { throw error }
}

const update = async (quiz_Id, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedQuiz = await quizModel.update(quiz_Id, updateData)

    return updatedQuiz
  } catch (error) { throw error }
}

const deleteItem = async (quiz_Id) => {
  try {
    const targetQuiz = await quizModel.findOneById(quiz_Id)
    if (!targetQuiz) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Quiz not found!')
    }
    await quizModel.deleteOneById(quiz_Id)

    await courseModel.pullQuizIds(targetQuiz)

    await lessonModel.pullQuizIds(targetQuiz)


    return { deleteResult: 'Delete successfully!' }
  } catch (error) { throw error }
}

export const quizService = {
  creatNew,
  getAllQuizs,
  getDetails,
  update,
  deleteItem
}