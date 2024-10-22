import express from 'express'
import { blogValidation } from '~/validations/blogValidation'
import { blogController } from '~/controllers/blogController'

const Router = express.Router()

Router.route('/')
  .get(blogController.getAllBlogs)
  .post(blogValidation.createNew, blogController.createNew)

Router.route('/:id')
  .get(blogController.getDetails)
  .put(blogValidation.update, blogController.update)
  .delete(blogValidation.deleteItem, blogController.deleteItem)


export const blogRoute = Router