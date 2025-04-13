import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { util } from '~/utils/util'
import { PERMISSION_TYPE } from '~/utils/constants'

const createNew = async (reqBody) => {
    try {
        const createdColumn = await columnModel.createNew(reqBody)
        const getNewColumn = await columnModel.findOneById(createdColumn.id)

        return getNewColumn
    } catch (error) {
        throw new Error(error)
    }
}

const getAllColumns = async (userId, boardId) => {
    try {
        await util.checkBoardPermission(userId, boardId)
        const columns = await columnModel.findAllByBoardId(boardId)
        return columns
    } catch (error) {
        throw new Error(error)
    }
}

const getDetails = async (userId, boardId, columnId) => {
    try {
        await util.checkBoardPermission(userId, boardId)
        const column = await columnModel.findOneById(columnId)
        if (!column) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
        }
        return column
    } catch (error) {
        throw new Error(error)
    }
}

const update = async (userId, boardId, columnId, reqBody) => {
    try {
        await util.checkBoardPermission(userId, boardId, PERMISSION_TYPE.WRITE)
        let updatedColumn = {}

        updatedColumn = await columnModel.update(columnId, reqBody)

        return updatedColumn
    } catch (error) {
        throw new Error(error)
    }
}

const deleteItems = async (userId, boardId, ids) => {
    try {
        const results = []
        for (const columnId of ids) {
            await util.checkBoardPermission(userId, boardId, PERMISSION_TYPE.WRITE)

            const column = await columnModel.findOneById(columnId)

            if (!column) {
                results.push({ message: `Column with id ${columnId} not found!` })
                continue
            }

            await columnModel.deleteItems(columnId)
            results.push({ message: `${column.title} column deleted successfully!` })
        }

        return results
    } catch (error) {
        throw new Error(error)
    }
}

export const columnService = {
    createNew,
    getAllColumns,
    getDetails,
    update,
    deleteItems
}