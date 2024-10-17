import express from 'express'
import { courseValidation } from '~/validations/courseValidation'
import { courseController } from '~/controllers/courseController'

const Router = express.Router()

Router.route('/')
  .get(courseController.getAllCourses)
  .post(courseValidation.createNew, courseController.createNew)

Router.route('/:id')
  .get(courseController.getDetails)
  .put(courseValidation.update, courseController.update)
  .delete(courseValidation.deleteItem, courseController.deleteItem)

export const courseRoute = Router