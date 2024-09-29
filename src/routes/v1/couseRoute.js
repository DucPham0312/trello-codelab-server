import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { couseValidation } from '~/validations/couseValidation'

const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API get list couses.' })
  })
  .post(couseValidation.createNew)

export const couseRoute = Router