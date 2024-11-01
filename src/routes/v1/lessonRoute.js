import express from 'express'
import { lessonValidation } from '~/validations/lessonValidation'
import { lessonController } from '~/controllers/lessonController'
import { authMiddleware } from '~/middlewares/authMiddleware'


const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, lessonController.getAllLessons)
  .post(authMiddleware.isAuthorized, lessonValidation.createNew, lessonController.createNew)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, lessonController.getDetails)
  .put(authMiddleware.isAuthorized, lessonValidation.update, lessonController.update)
  .delete(authMiddleware.isAuthorized, lessonValidation.deleteItem, lessonController.deleteItem)

export const lessonRoute = Router