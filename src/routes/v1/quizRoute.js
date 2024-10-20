import express from 'express'
import { quizValidation } from '~/validations/quizValidation'
import { quizController } from '~/controllers/quizController'

const Router = express.Router()

Router.route('/')
  .get(quizController.getAllQuizs)
  .post(quizValidation.createNew, quizController.createNew)

Router.route('/:id')
  .get(quizController.getDetails)
  .put(quizValidation.update, quizController.update)
  .delete(quizValidation.deleteItem, quizController.deleteItem)


export const quizRoute = Router