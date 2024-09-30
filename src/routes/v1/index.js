import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { courseRoute } from '~/routes/v1/courseRoute'

const Router = express.Router()

//Check API V1 status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.', code: StatusCodes.OK })
})

//Board APIs
Router.use('/courses', courseRoute)

export const APIs_V1 = Router
