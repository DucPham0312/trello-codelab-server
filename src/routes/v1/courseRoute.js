import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { courseValidation } from '~/validations/courseValidation'
import { courseController } from '~/controllers/courseController'

const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API get list couses.' })
  })
  .post(courseValidation.createNew, courseController.createNew)

Router.route('/:id')
  .get(courseController.getDetails)
  .put(courseValidation.update, courseController.update)
  .delete(courseController.deleteItem, courseController.deleteItem)

export const courseRoute = Router