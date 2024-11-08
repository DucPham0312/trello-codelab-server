import express from 'express'
import { invitationValidation } from '~/validations/invitationValidation'
import { invitationController } from '~/controllers/invitationController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/course')
  .post(
    authMiddleware.isAuthorized,
    invitationValidation.createNewCourseInvitation,
    invitationController.createNewCourseInvitation
  )

Router.route('/')
  .get(authMiddleware.isAuthorized, invitationController.getInvitations)

export const invitationRoute = Router
