import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { courseRoute } from '~/routes/v1/courseRoute'
import { lessonRoute } from '~/routes/v1/lessonRoute'
import { quizRoute } from '~/routes/v1/quizRoute'
import { userRoute } from '~/routes/v1/userRoute'
import { invitationRoute } from '~/routes/v1/invitationRoute'


const Router = express.Router()

//Check API V1 status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.', code: StatusCodes.OK })
})

//Board APIs
Router.use('/courses', courseRoute)

Router.use('/lessons', lessonRoute)

Router.use('/quizs', quizRoute)

Router.use('/users', userRoute)

Router.use('/invitations', invitationRoute)

export const APIs_V1 = Router
