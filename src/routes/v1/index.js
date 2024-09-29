import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { couseRoute } from '~/routes/v1/couseRoute'

const Router = express.Router()

//Check API V1 status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.', code: StatusCodes.OK })
})

//Board APIs
Router.use('/couses', couseRoute)

export const APIs_V1 = Router
