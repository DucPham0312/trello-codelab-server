import Joi from 'joi'
import db from '~/utils/db'
import { v4 as uuidv4 } from 'uuid'
import { columnModel } from './columnModel'
import { boardModel } from './boardModel'

const CARD_SCHEMA = Joi.object({
    column_id: Joi.string().required(),
    board_id: Joi.string().required(),
    title: Joi.string().required().trim().strict(),
    description: Joi.string().trim().strict(),
    cover_url: Joi.string().trim().strict(),
    position: Joi.number().integer().default(0)
})

const validateBeforeCreate = async (data) => {
    return await CARD_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data, userId) => {
    try {
        const validData = await validateBeforeCreate(data)

        // Check if column exists
        const column = await columnModel.findOneById(validData.column_id)
        if (!column) {
            throw new Error('Column not found')
        }

        // Check if board exists
        const board = await boardModel.findOneById(validData.board_id)
        if (!board) {
            throw new Error('Board not found')
        }

        const id = uuidv4()

        // Start transaction
        await db.query('START TRANSACTION')

        try {
            // Insert card
            const cardQuery = `
                INSERT INTO cards (
                    id, column_id, board_id, title, description, cover_url, position
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `

            const cardValues = [
                id,
                validData.column_id,
                validData.board_id,
                validData.title,
                validData.description,
                validData.cover_url,
                validData.position
            ]

            await db.query(cardQuery, cardValues)

            // Add creator as card member
            const memberQuery = `
                INSERT INTO card_members (
                    card_id, user_id
                ) VALUES (?, ?)
            `

            await db.query(memberQuery, [id, userId])

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
        const query = 'SELECT * FROM cards WHERE id = ?'
        const [rows] = await db.query(query, [id])
        return rows[0] || null
    } catch (error) {
        throw new Error(error)
    }
}

const findAllByColumnId = async (columnId) => {
    try {
        const query = 'SELECT * FROM cards WHERE column_id = ? ORDER BY position ASC'
        const [rows] = await db.query(query, [columnId])
        return rows
    } catch (error) {
        throw new Error(error)
    }
}

const findAllByBoardId = async (boardId) => {
    try {
        const query = 'SELECT * FROM cards WHERE board_id = ? ORDER BY position ASC'
        const [rows] = await db.query(query, [boardId])
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
            if (key !== 'id' && key !== 'column_id' && key !== 'board_id' && key !== 'created_at') {
                fields.push(`${key} = ?`)
                values.push(value)
            }
        })

        values.push(id)
        const query = `UPDATE cards SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        await db.query(query, values)

        return await findOneById(id)
    } catch (error) {
        throw new Error(error)
    }
}

const deleteOne = async (id) => {
    try {
        const query = 'DELETE FROM cards WHERE id = ?'
        await db.query(query, [id])
        return true
    } catch (error) {
        throw new Error(error)
    }
}

export const cardModel = {
    CARD_SCHEMA,
    createNew,
    findOneById,
    findAllByColumnId,
    findAllByBoardId,
    update,
    deleteOne
} 