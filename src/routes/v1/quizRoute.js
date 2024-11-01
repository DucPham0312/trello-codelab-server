import express from 'express'
import { quizValidation } from '~/validations/quizValidation'
import { quizController } from '~/controllers/quizController'
import { authMiddleware } from '~/middlewares/authMiddleware'


const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, quizController.getAllQuizs)
  .post(authMiddleware.isAuthorized, quizValidation.createNew, quizController.createNew)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, quizController.getDetails)
  .put(authMiddleware.isAuthorized, quizValidation.update, quizController.update)
  .delete(authMiddleware.isAuthorized, quizValidation.deleteItem, quizController.deleteItem)


export const quizRoute = Router