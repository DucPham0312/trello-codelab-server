import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
    try {
        const newCard = {
            column_id: reqBody.column_id,
            board_id: reqBody.board_id,
            title: reqBody.title,
            description: reqBody.description,
            cover_url: reqBody.cover_url,
            position: reqBody.position
        }

        const createdCard = await cardModel.createNew(newCard)
        return createdCard
    } catch (error) {
        throw new Error(error)
    }
}

const getDetails = async (cardId) => {
    try {
        const card = await cardModel.findOneById(cardId)
        if (!card) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')
        }
        return card
    } catch (error) {
        throw new Error(error)
    }
}

const update = async (cardId, reqBody) => {
    try {
        const updateData = {
            ...reqBody
        }

        const updatedCard = await cardModel.update(cardId, updateData)
        if (!updatedCard) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')
        }

        return updatedCard
    } catch (error) {
        throw new Error(error)
    }
}

const deleteItem = async (cardId) => {
    try {
        const targetCard = await cardModel.findOneById(cardId)
        if (!targetCard) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')
        }

        await cardModel.deleteOne(cardId)
        return { deleteResult: 'Card deleted successfully!' }
    } catch (error) {
        throw new Error(error)
    }
}

export const cardService = {
    createNew,
    getDetails,
    update,
    deleteItem
}