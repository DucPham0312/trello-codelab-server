import express from 'express'
import { courseValidation } from '~/validations/courseValidation'
import { courseController } from '~/controllers/courseController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'


const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, courseController.getAllCourses)
  .post(authMiddleware.isAuthorized, courseValidation.createNew, courseController.createNew)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, courseController.getDetails)
  .put(authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('courseCover'),
    courseValidation.update,
    courseController.update)
  .delete(authMiddleware.isAuthorized, courseValidation.deleteItem, courseController.deleteItem)

export const courseRoute = Router