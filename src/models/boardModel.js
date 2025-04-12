import Joi from 'joi'
import db from '~/utils/db'
import { v4 as uuidv4 } from 'uuid'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const BOARD_SCHEMA = Joi.object({
    title: Joi.string().required().trim().strict(),
    description: Joi.string().trim().strict(),
    type: Joi.string().valid('public', 'private').default('public'),
    is_deleted: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
    return await BOARD_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (userId, data) => {
    try {
        const validData = await validateBeforeCreate(data)
        const id = uuidv4()
        const created_by = userId

        // Start transaction
        await db.query('START TRANSACTION')

        try {
            // Insert board
            const boardQuery = `
                INSERT INTO boards (
                    id, title, description, type, created_by
                ) VALUES (?, ?, ?, ?, ?)
            `

            const boardValues = [
                id,
                validData.title,
                validData.description,
                validData.type,
                created_by
            ]

            await db.query(boardQuery, boardValues)

            // Insert board owner
            const ownerQuery = `
                INSERT INTO board_owners (
                    board_id, user_id
                ) VALUES (?, ?)
            `

            await db.query(ownerQuery, [id, userId])

            // Commit transaction
            await db.query('COMMIT')

            return { id, ...validData }
        } catch (error) {
            // Rollback transaction
            await db.query('ROLLBACK')
            throw error
        }
    } catch (error) {
        throw new Error(error)
    }
}

const findOneById = async (userId, boardId) => {
    try {
        // Check if user has access to this board
        const ownerQuery = `
            SELECT * FROM board_owners 
            WHERE board_id = ? AND user_id = ?
        `
        const [ownerRows] = await db.query(ownerQuery, [boardId, userId])

        if (!ownerRows.length) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Do not have permission to view this board')
        }

        // If user has access, get board details
        const boardQuery = 'SELECT * FROM boards WHERE id = ? AND is_deleted = false'
        const [boardRows] = await db.query(boardQuery, [boardId])

        return boardRows[0] || null

    } catch (error) {
        throw new Error(error)
    }
}

const findAll = async () => {
    try {
        const query = 'SELECT * FROM boards WHERE is_deleted = false ORDER BY created_at DESC'
        const [rows] = await db.query(query)
        return rows
    } catch (error) {
        throw new Error(error)
    }
}

const update = async (id, data) => {
    try {
        const validData = await validateBeforeCreate(data)
        const fields = []
        const values = []

        Object.entries(validData).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'created_at') {
                fields.push(`${key} = ?`)
                values.push(value)
            }
        })

        values.push(id)
        const query = `UPDATE boards SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        await db.query(query, values)

        return await findOneById(id)
    } catch (error) {
        throw new Error(error)
    }
}

const deleteOne = async (id) => {
    try {
        const query = 'UPDATE boards SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        await db.query(query, [id])
        return true
    } catch (error) {
        throw new Error(error)
    }
}

export const boardModel = {
    BOARD_SCHEMA,
    createNew,
    findOneById,
    findAll,
    update,
    deleteOne
}