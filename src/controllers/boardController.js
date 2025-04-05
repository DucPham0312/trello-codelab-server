import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id

        //Điều hướng dữ liệu qua tầng Service
        const createdBoard = await boardService.creatNew(userId, req.body)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.CREATED).json(createdBoard)
    } catch (error) { next(error) }
}

const getAllBoards = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id
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
        const userId = req.jwtDecoded._id
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
        const userInfo = req.jwtDecoded
        const updatedBoard = await boardService.update(boardId, req.body, boardCoverFile, userInfo)
        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(updatedBoard)
    } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
    try {
        const boardId = req.params.id
        const result = await boardService.deleteItem(boardId)

        //Có kết quả thì trả về Client
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

export const boardController = {
    createNew,
    getAllBoards,
    getDetails,
    update,
    deleteItem
}