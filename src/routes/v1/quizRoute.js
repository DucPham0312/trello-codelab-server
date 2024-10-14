import express from 'express'
import { quizValidation } from '~/validations/quizValidation'
import { quizController } from '~/controllers/quizController'

const Router = express.Router()

Router.route('/')
  .post(quizValidation.createNew, quizController.createNew)

export const quizRoute = Router