import express from 'express'
import { contentValidation } from '~/validations/contentValidation'
import { contentController } from '~/controllers/contentController'

const Router = express.Router()

Router.route('/')
  .get(contentController.getAllContents)
  .post(contentValidation.createNew, contentController.createNew)

Router.route('/:id')
  .get(contentController.getDetails)
  .put(contentValidation.update, contentController.update)
  .delete(contentValidation.deleteItem, contentController.deleteItem)


export const contentRoute = Router