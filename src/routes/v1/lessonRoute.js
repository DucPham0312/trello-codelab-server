import express from 'express'
import { lessonValidation } from '~/validations/lessonValidation'
import { lessonController } from '~/controllers/lessonController'

const Router = express.Router()

Router.route('/')
  .post(lessonValidation.createNew, lessonController.createNew)

Router.route('/:id')
  .put(lessonValidation.update, lessonController.update)
  .delete(lessonValidation.deleteItem, lessonController.deleteItem)

export const lessonRoute = Router