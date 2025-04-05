import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const createNew = async (req, res, next) => {
    try {
        const createdCard = await cardService.creatNew(req.body)
        res.status(StatusCodes.CREATED).json(createdCard)
    } catch (error) { next(error) }
}

const getAllCards = async (req, res, next) => {
    try {
        const cards = await cardService.getAllCards()
        res.status(StatusCodes.OK).json(cards)
    } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
    try {
        const cardId = req.params.id

        const card = await cardService.getDetails(cardId)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(card)
    } catch (error) { next(error) }
}

const update = async (req, res, next) => {
    try {
        const cardId = req.params.id
        const updatedCard = await cardService.update(cardId, req.body)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(updatedCard)
    } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
    try {
        const cardId = req.params.id
        const result = await cardService.deleteItem(cardId)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}


export const cardController = {
    createNew,
    getAllCards,
    getDetails,
    update,
    deleteItem
}