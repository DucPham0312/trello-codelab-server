import express from 'express'
import { reminderValidation } from '~/validations/reminderValidation'
import { reminderController } from '~/controllers/reminderController'

const Router = express.Router()

Router.route('/')
  .get(reminderController.getAllReminders)
  .post(reminderValidation.createNew, reminderController.createNew)

Router.route('/:id')
  .get(reminderController.getDetails)
  .put(reminderValidation.update, reminderController.update)
  .delete(reminderValidation.deleteItem, reminderController.deleteItem)

export const reminderRoute = Router