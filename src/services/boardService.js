/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { boardModel } from '~/models/boardModel'
import { util } from '~/utils/util'

const createNew = async (userId, data) => {
    try {
        const createdBoard = await boardModel.createNew(userId, data)
        const getNewBoard = await boardModel.findOneById(createdBoard.id)

        return getNewBoard
    } catch (error) {
        throw new Error(error)
    }
}

const getAllBoards = async (userId, page, itemsPerPage, queryFilters) => {
    try {
        //Nếu không tồn tại page hoặc itemPerPage từ FE thì cần phải luôn gắn giá trị mặc định
        if (!page) page = DEFAULT_PAGE
        if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

        const results = await boardModel.getAllBoards(
            userId,
            parseInt(page, 10),
            parseInt(itemsPerPage, 10),
            queryFilters
        )

        return results
    } catch (error) { throw error }
}

const getDetails = async (userId, boardId) => {
    try {
        await util.checkBoardPermission(userId, boardId)
        const board = await boardModel.findOneById(boardId)
        if (!board) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
        }
        return board
    } catch (error) {
        throw new Error(error)
    }
}

const update = async (boardId, reqBody, boardCoverFile, userId) => {
    try {
        await util.checkBoardPermission(userId, boardId)
        let updatedBoard = {}

        if (boardCoverFile) {
            //Upload cover lên cloud storage (Cloundinary)
            const uploadResult = await CloudinaryProvider.streamUpload(boardCoverFile.buffer, 'boards')

            //Lưu lại url (secure_url) vào database
            updatedBoard = await boardModel.update(boardId, {
                cover: uploadResult.secure_url
            }, userId)
        }
        else {
            //update thông tin chung
            updatedBoard = await boardModel.update(boardId, reqBody)
        }

        return updatedBoard
    } catch (error) {
        throw new Error(error)
    }
}

const deleteSoftItems = async (userId, boardIds) => {
    try {
        const results = []
        for (const boardId of boardIds) {

            const board = await boardModel.findOneById(boardId)

            if (!board) {
                results.push({ message: `Board with id ${boardId} not found!` })
                continue
            }

            if (board.created_by !== userId) {
                results.push({ message: `You are not allowed to delete the ${board.title} board.` })
                continue
            }

            await boardModel.deleteSoftOne(boardId)
            results.push({ message: `${board.title} board deleted successfully!` })
        }

        return results
    } catch (error) {
        throw new Error(error)
    }
}


export const boardService = {
    createNew,
    getAllBoards,
    getDetails,
    update,
    deleteSoftItems
}