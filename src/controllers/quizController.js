import { StatusCodes } from 'http-status-codes'
import { quizService } from '~/services/quizService'

const createNew = async (req, res, next) => {
  try {
    const createdQuiz = await quizService.creatNew(req.body)
    res.status(StatusCodes.CREATED).json(createdQuiz)
  } catch (error) { next(error) }
}

const getAllQuizs = async (req, res, next) => {
  try {
    const quizs = await quizService.getAllQuizs()
    res.status(StatusCodes.OK).json(quizs)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    // console.log('req.params: ', req.params)
    const quizId = req.params.id

    const quiz = await quizService.getDetails(quizId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(quiz)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const quizId = req.params.id
    const updatedQuiz = await quizService.update(quizId, req.body)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedQuiz)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const quizId = req.params.id
    const result = await quizService.deleteItem(quizId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}


export const quizController = {
  createNew,
  getAllQuizs,
  getDetails,
  update,
  deleteItem
}