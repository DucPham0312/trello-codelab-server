import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { util } from '~/utils/util'
import { PERMISSION_TYPE } from '~/utils/constants'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { userModel } from '~/models/userModel'

const createNew = async (userId, reqBody) => {
    try {
        const createdCard = await cardModel.createNew(userId, reqBody)
        const getNewCard = await cardModel.findOneById(createdCard.id)

        return getNewCard
    } catch (error) {
        throw new Error(error)
    }
}

const getAllCards = async (userId, boardId, columnId) => {
    try {
        await util.checkBoardPermission(userId, boardId)
        const cards = await cardModel.findAllByColumnId(columnId)
        return cards
    } catch (error) {
        throw new Error(error)
    }
}

const getDetails = async (userId, boardId, cardId) => {
    try {
        await util.checkBoardPermission(userId, boardId)
        const card = await cardModel.findOneById(cardId)
        if (!card) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')
        }
        return card
    } catch (error) {
        throw new Error(error)
    }
}

const update = async (userId, boardId, cardId, reqBody, cardCoverFile) => {
    try {
        await util.checkBoardPermission(userId, boardId, PERMISSION_TYPE.WRITE)
        let updatedCard = {}

        if (cardCoverFile) {
            //Upload cover lên cloud storage (Cloundinary)
            const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'cards')

            //Lưu lại url (secure_url) vào database
            updatedCard = await cardModel.update(cardId, {
                cover_url: uploadResult.secure_url
            }, userId)
        }
        else {
            //update thông tin chung
            updatedCard = await cardModel.update(cardId, reqBody)
        }

        return updatedCard
    } catch (error) {
        throw new Error(error)
    }
}

const deleteItems = async (userId, boardId, ids) => {
    try {
        const results = []
        for (const cardId of ids) {
            await util.checkBoardPermission(userId, boardId, PERMISSION_TYPE.WRITE)

            const card = await cardModel.findOneById(cardId)

            if (!card) {
                results.push({ message: `Card with id ${cardId} not found!` })
                continue
            }

            await cardModel.deleteItem(cardId)
            results.push({ message: `${card.title} card deleted successfully!` })
        }

        return results
    } catch (error) {
        throw new Error(error)
    }
}

const addMembers = async (userId, boardId, cardId, ids) => {
    try {
        const results = []
        for (const userAdd of ids) {
            await util.checkBoardPermission(userId, boardId, PERMISSION_TYPE.WRITE)

            const user = await userModel.findOneById(userAdd)

            if (!user) {
                results.push({ message: `User ${user.email} not found!` })
                continue
            }

            await cardModel.addMember(userAdd, cardId)
            results.push({ message: `Add ${user.email} successfully!` })
        }

        return results
    } catch (error) {
        throw new Error(error)
    }
}

const deleteMembers = async (userId, boardId, cardId, ids) => {
    try {
        const results = []
        for (const userAdd of ids) {
            await util.checkBoardPermission(userId, boardId, PERMISSION_TYPE.WRITE)

            const user = await userModel.findOneById(userAdd)

            if (!user) {
                results.push({ message: `User ${user.email} not found!` })
                continue
            }

            await cardModel.deleteMember(userAdd, cardId)
            results.push({ message: `Delete ${user.email} successfully!` })
        }

        return results
    } catch (error) {
        throw new Error(error)
    }
}

export const cardService = {
    createNew,
    getDetails,
    update,
    deleteItems,
    getAllCards,
    addMembers,
    deleteMembers
}