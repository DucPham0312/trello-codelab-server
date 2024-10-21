import express from 'express'
import { notificationValidation } from '~/validations/notificationValidation'
import { notificationController } from '~/controllers/notificationController'

const Router = express.Router()

Router.route('/')
  .get(notificationController.getAllNotifications)
  .post(notificationValidation.createNew, notificationController.createNew)

Router.route('/:id')
  .get(notificationController.getDetails)
  .put(notificationValidation.update, notificationController.update)
  .delete(notificationValidation.deleteItem, notificationController.deleteItem)


export const notificationRoute = Router