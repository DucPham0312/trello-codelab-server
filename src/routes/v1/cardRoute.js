import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const Router = express.Router()

Router.route('/')
    .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

Router.route('/:boardId/:columnId')
    .get(authMiddleware.isAuthorized, cardController.getAllCards)

Router.route('/detail/:boardId/:cardId')
    .get(authMiddleware.isAuthorized, cardController.getDetails)
    // .delete(authMiddleware.isAuthorized, cardValidation.deleteItem, cardController.deleteItem)
    .put(authMiddleware.isAuthorized,
        multerUploadMiddleware.upload.single('cardCover'),
        cardValidation.update,
        cardController.update)

Router.route('/:id')
    .delete(authMiddleware.isAuthorized, cardValidation.idItems, cardController.deleteItems)

Router.route('/member/:boardId/:cardId')
    .post(authMiddleware.isAuthorized, cardController.addMembers)
    .delete(authMiddleware.isAuthorized, cardValidation.idItems, cardController.deleteMembers)

export const cardRoute = Router