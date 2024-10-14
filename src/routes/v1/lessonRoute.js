import express from 'express'
import { lessonValidation } from '~/validations/lessonValidation'
import { lessonController } from '~/controllers/lessonController'

const Router = express.Router()

Router.route('/')
  .post(lessonValidation.createNew, lessonController.createNew)

export const lessonRoute = Router