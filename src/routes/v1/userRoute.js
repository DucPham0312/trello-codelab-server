import express from 'express'
import { userValidation } from '~/validations/userValidation'
import { userController } from '~/controllers/userController'

const Router = express.Router()

Router.route('/')
  .get(userController.getAllUsers)

Router.route('/:id')
  .get(userController.getDetails)
  .put(userValidation.update, userController.update)
  .delete(userValidation.deleteItem, userController.deleteItem)

export const userRoute = Router