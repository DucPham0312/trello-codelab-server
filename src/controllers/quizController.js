import { StatusCodes } from 'http-status-codes'
import { quizService } from '~/services/quizService'

const createNew = async (req, res, next) => {
  try {
    const createdQuiz = await quizService.creatNew(req.body)
    res.status(StatusCodes.CREATED).json(createdQuiz)
  } catch (error) { next(error) }
}


export const quizController = {
  createNew
}