import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { userController } from '~/controllers/userController'

const Router = express.Router()

Router.route('/')
  .get(userController.getAllUsers)
  .delete(userValidation.deleteManyUsers, userController.deleteManyUsers)

Router.route('/:id')
  .get(userController.getDetails)
  .put(userValidation.update, userController.update)

export const userRoute = Router