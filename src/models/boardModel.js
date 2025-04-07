import Joi from 'joi'
import { db } from '~/utils/db'
import { v4 as uuidv4 } from 'uuid'

const BOARD_SCHEMA = Joi.object({
    title: Joi.string().required().trim().strict(),
    description: Joi.string().trim().strict(),
    type: Joi.string().valid('public', 'private').default('public'),
    is_deleted: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
    return await BOARD_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data, userId) => {
    try {
        const validData = await validateBeforeCreate(data)
        const id = uuidv4()

        // Start transaction
        await db.query('START TRANSACTION')

        try {
            // Insert board
            const boardQuery = `
                INSERT INTO boards (
                    id, title, description, type, is_deleted
                ) VALUES (?, ?, ?, ?, ?)
            `

            const boardValues = [
                id,
                validData.title,
                validData.description,
                validData.type,
                validData.is_deleted
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

const findOneById = async (id) => {
    try {
        const query = 'SELECT * FROM boards WHERE id = ? AND is_deleted = false'
        const [rows] = await db.query(query, [id])
        return rows[0] || null
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