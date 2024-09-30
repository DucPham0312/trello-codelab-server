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

export const courseRoute = Router