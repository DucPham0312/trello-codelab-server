import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { userFbRouter } from '~/routes/fbase/userFbRoute'

const Router = express.Router()

//Check API fbase status
Router.get('/fbstatus', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs fasebase are ready to use.', code: StatusCodes.OK })
})

Router.use('/users', userFbRouter)

export const APIs_fbase = Router