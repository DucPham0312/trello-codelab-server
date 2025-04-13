import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id

        //Điều hướng dữ liệu qua tầng Service
        const createdBoard = await boardService.createNew(userId, req.body)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.CREATED).json(createdBoard)
    } catch (error) { next(error) }
}

const getAllBoards = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id
        //page và itemsPerPage được truyền vào trong query url từ phía FE nên BE lấy thông qua req.query
        const { page, itemsPerPage, value } = req.query
        const queryFilters = value
        const results = await boardService.getAllBoards(userId, page, itemsPerPage, queryFilters)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(results)
    } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded.id
        const boardId = req.params.id

        const board = await boardService.getDetails(userId, boardId)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(board)
    } catch (error) { next(error) }
}

const update = async (req, res, next) => {
    try {
        const boardId = req.params.id
        const boardCoverFile = req.file
        const userId = req.jwtDecoded.id
        const updatedBoard = await boardService.update(boardId, req.body, boardCoverFile, userId)
        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(updatedBoard)
    } catch (error) { next(error) }
}

const deleteSoftItems = async (req, res, next) => {
    try {
        const { ids } = req.body
        const userId = req.jwtDecoded.id

        if (!Array.isArray(ids) || ids.length === 0) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or empty ids array')
        }

        const result = await boardService.deleteSoftItems(userId, ids)

        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}


export const boardController = {
    createNew,
    getAllBoards,
    getDetails,
    update,
    deleteSoftItems
}