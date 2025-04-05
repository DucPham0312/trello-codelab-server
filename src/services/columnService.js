import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
    try {
        const newColumn = {
            board_id: reqBody.board_id,
            title: reqBody.title,
            position: reqBody.position
        }

        const createdColumn = await columnModel.createNew(newColumn)
        return createdColumn
    } catch (error) {
        throw new Error(error)
    }
}

const getDetails = async (columnId) => {
    try {
        const column = await columnModel.findOneById(columnId)
        if (!column) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
        }
        return column
    } catch (error) {
        throw new Error(error)
    }
}

const update = async (columnId, reqBody) => {
    try {
        const updateData = {
            ...reqBody
        }

        const updatedColumn = await columnModel.update(columnId, updateData)
        if (!updatedColumn) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
        }

        return updatedColumn
    } catch (error) {
        throw new Error(error)
    }
}

const deleteItem = async (columnId) => {
    try {
        const targetColumn = await columnModel.findOneById(columnId)
        if (!targetColumn) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
        }

        await columnModel.deleteOne(columnId)
        return { deleteResult: 'Column deleted successfully!' }
    } catch (error) {
        throw new Error(error)
    }
}

export const columnService = {
    createNew,
    getDetails,
    update,
    deleteItem
}