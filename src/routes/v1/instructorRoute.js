import express from 'express'
import { instructorValidation } from '~/validations/instructorValidation'
import { instructorController } from '~/controllers/instructorController'

const Router = express.Router()

Router.route('/')
  .get(instructorController.getAllInstructors)
  .post(instructorValidation.createNew, instructorController.createNew)

Router.route('/:id')
  .get(instructorController.getDetails)
  .put(instructorValidation.update, instructorController.update)
  .delete(instructorValidation.deleteItem, instructorController.deleteItem)

export const instructorRoute = Router