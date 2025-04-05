import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'


const Router = express.Router()

Router.route('/')
    .get(authMiddleware.isAuthorized, cardController.getAllQuizs)
    .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

Router.route('/:id')
    .get(authMiddleware.isAuthorized, cardController.getDetails)
    .put(authMiddleware.isAuthorized, cardValidation.update, cardController.update)
    .delete(authMiddleware.isAuthorized, cardValidation.deleteItem, cardController.deleteItem)


export const cardRoute = Router