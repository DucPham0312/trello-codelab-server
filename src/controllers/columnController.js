import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

const createNew = async (req, res, next) => {
    try {
        const createdColumn = await columnService.createNew(req.body)
        res.status(StatusCodes.CREATED).json(createdColumn)
    } catch (error) { next(error) }
}

const getAllColumns = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id
        const boardId = req.params.id
        const columns = await columnService.getAllColumns(userId, boardId)
        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(columns)
    } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id
        const boardId = req.params.boardId
        const columnId = req.params.columnId
        const column = await columnService.getDetails(userId, boardId, columnId)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(column)
    } catch (error) { next(error) }
}

const update = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id
        const boardId = req.params.boardId
        const columnId = req.params.columnId
        const updatedColumn = await columnService.update(userId, boardId, columnId, req.body)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(updatedColumn)
    } catch (error) { next(error) }
}

const deleteItems = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id
        const boardId = req.params.id
        const { ids } = req.body
        const result = await columnService.deleteItems(userId, boardId, ids)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

export const columnController = {
    createNew,
    getAllColumns,
    getDetails,
    update,
    deleteItems
}