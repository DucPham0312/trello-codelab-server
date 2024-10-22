import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { courseRoute } from '~/routes/v1/courseRoute'
import { lessonRoute } from '~/routes/v1/lessonRoute'
import { quizRoute } from '~/routes/v1/quizRoute'
import { notificationRoute } from '~/routes/v1/notificationRoute'
import { blogRoute } from '~/routes/v1/blogRoute'
import { contentRoute } from '~/routes/v1/contentRoute'
import { instructorRoute } from '~/routes/v1/instructorRoute'
import { userRoute } from '~/routes/v1/userRoute'
import { reminderRoute } from '~/routes/v1/reminderRoute'
import { reviewRoute } from '~/routes/v1/reviewRoute'



const Router = express.Router()

//Check API V1 status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.', code: StatusCodes.OK })
})

//Board APIs
Router.use('/courses', courseRoute)

Router.use('/lessons', lessonRoute)

Router.use('/quizs', quizRoute)

Router.use('/notifications', notificationRoute)

Router.use('/blogs', blogRoute)

Router.use('/contents', contentRoute)

Router.use('/instructors', instructorRoute)

Router.use('/users', userRoute)

Router.use('/reminders', reminderRoute)

Router.use('/reviews', reviewRoute)

export const APIs_V1 = Router
