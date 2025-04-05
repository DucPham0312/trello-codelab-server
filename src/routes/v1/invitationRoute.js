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

//Get intitation by User
Router.route('/')
    .get(authMiddleware.isAuthorized, invitationController.getInvitations)

//Update Course Invitation
Router.route('/course/:invitationId')
    .put(authMiddleware.isAuthorized, invitationController.updateCourseInvitation)

export const invitationRoute = Router
