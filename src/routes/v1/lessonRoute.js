import express from 'express'
import { lessonValidation } from '~/validations/lessonValidation'
import { lessonController } from '~/controllers/lessonController'

const Router = express.Router()

Router.route('/')
  .get(lessonController.getAllLessons)
  .post(lessonValidation.createNew, lessonController.createNew)

Router.route('/:id')
  .get(lessonController.getDetails)
  .put(lessonValidation.update, lessonController.update)
  .delete(lessonValidation.deleteItem, lessonController.deleteItem)

export const lessonRoute = Router