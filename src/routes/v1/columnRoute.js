import express from 'express'
import { columnValidation } from '~/validations/columnValidation'
import { columnController } from '~/controllers/columnController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'


const Router = express.Router()

Router.route('/')
    .get(authMiddleware.isAuthorized, columnController.getAllColumns)
    .post(authMiddleware.isAuthorized, columnValidation.createNew, columnController.createNew)

Router.route('/:id')
    .get(authMiddleware.isAuthorized, columnController.getDetails)
    .put(authMiddleware.isAuthorized,
        multerUploadMiddleware.upload.single('lessonCover'),
        columnValidation.update,
        columnController.update)
    .delete(authMiddleware.isAuthorized, columnValidation.deleteItem, columnController.deleteItem)

export const columnRoute = Router