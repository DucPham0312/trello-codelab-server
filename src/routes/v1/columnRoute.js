import express from 'express'
import { columnValidation } from '~/validations/columnValidation'
import { columnController } from '~/controllers/columnController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
    .post(authMiddleware.isAuthorized, columnValidation.createNew, columnController.createNew)

Router.route('/:id')
    .get(authMiddleware.isAuthorized, columnController.getAllColumns)
    .delete(authMiddleware.isAuthorized, columnValidation.deleteItems, columnController.deleteItems)

Router.route('/:boardId/:columnId')
    .get(authMiddleware.isAuthorized, columnController.getDetails)
    .put(authMiddleware.isAuthorized,
        columnValidation.update,
        columnController.update)

export const columnRoute = Router