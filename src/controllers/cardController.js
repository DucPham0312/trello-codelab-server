import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const createNew = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id
        const createdCard = await cardService.createNew(userId, req.body)
        res.status(StatusCodes.CREATED).json(createdCard)
    } catch (error) { next(error) }
}

const getAllCards = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id
        const boardId = req.params.boardId
        const columnId = req.params.columnId
        const cards = await cardService.getAllCards(userId, boardId, columnId)
        res.status(StatusCodes.OK).json(cards)
    } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id
        const boardId = req.params.boardId
        const cardId = req.params.cardId

        const card = await cardService.getDetails(userId, boardId, cardId)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(card)
    } catch (error) { next(error) }
}

const update = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id
        const boardId = req.params.boardId
        const cardId = req.params.cardId
        const cardCoverFile = req.file

        const updatedCard = await cardService.update(userId, boardId, cardId, req.body, cardCoverFile)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(updatedCard)
    } catch (error) { next(error) }
}

const deleteItems = async (req, res, next) => {
    try {
        const boardId = req.params.id
        const userId = req.jwtDecoded.id
        const { ids } = req.body
        const result = await cardService.deleteItems(userId, boardId, ids)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

const addMembers = async (req, res, next) => {
    try {
        const boardId = req.params.boardId
        const cardId = req.params.cardId
        const userId = req.jwtDecoded.id
        const { ids } = req.body
        const result = await cardService.addMembers(userId, boardId, cardId, ids)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

const deleteMembers = async (req, res, next) => {
    try {
        const boardId = req.params.boardId
        const cardId = req.params.cardId
        const userId = req.jwtDecoded.id
        const { ids } = req.body
        const result = await cardService.deleteMembers(userId, boardId, cardId, ids)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}


export const cardController = {
    createNew,
    getAllCards,
    getDetails,
    update,
    deleteItems,
    addMembers,
    deleteMembers
}