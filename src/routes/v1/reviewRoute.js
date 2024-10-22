import express from 'express'
import { reviewValidation } from '~/validations/reviewValidation'
import { reviewController } from '~/controllers/reviewController'

const Router = express.Router()

Router.route('/')
  .get(reviewController.getAllReviews)
  .post(reviewValidation.createNew, reviewController.createNew)

Router.route('/:id')
  .get(reviewController.getDetails)
  .put(reviewValidation.update, reviewController.update)
  .delete(reviewValidation.deleteItem, reviewController.deleteItem)

export const reviewRoute = Router