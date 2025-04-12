/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { boardModel } from '~/models/boardModel'

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
        const board = await boardModel.findOneById(userId, boardId)
        if (!board) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
        }
        return board
    } catch (error) {
        throw new Error(error)
    }
}

const update = async (boardId, reqBody) => {
    try {
        const updateData = {
            ...reqBody
        }

        const updatedBoard = await boardModel.update(boardId, updateData)
        if (!updatedBoard) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
        }

        return updatedBoard
    } catch (error) {
        throw new Error(error)
    }
}

const deleteItem = async (boardId) => {
    try {
        const targetBoard = await boardModel.findOneById(boardId)
        if (!targetBoard) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
        }

        await boardModel.deleteOne(boardId)
        return { deleteResult: 'Board deleted successfully!' }
    } catch (error) {
        throw new Error(error)
    }
}

export const boardService = {
    createNew,
    getAllBoards,
    getDetails,
    update,
    deleteItem
}