import Joi from 'joi'
import db from '~/utils/db'
import { v4 as uuidv4 } from 'uuid'
import { columnModel } from './columnModel'
import { boardModel } from './boardModel'

const CARD_SCHEMA = Joi.object({
    column_id: Joi.string().required(),
    board_id: Joi.string().required(),
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().allow(null),
    cover_url: Joi.string().allow(null),
    deadline: Joi.date().allow(null),
    is_completed: Joi.boolean().default(false),
    google_event_id: Joi.string().allow(null)
})

const validateBeforeCreate = async (data) => {
    return await CARD_SCHEMA.validateAsync(data, { abortEarly: false })
}

const INVALID_UPDATE_FIELDS = ['id', 'board_id', 'created_at']


const createNew = async (userId, data) => {
    try {
        const validData = await validateBeforeCreate(data)

        const board = await boardModel.findOneById(validData.board_id)
        if (!board) {
            throw new Error('Board not found')
        }

        const column = await columnModel.findOneById(validData.column_id)
        if (!column) {
            throw new Error('Column not found')
        }

        const id = uuidv4()

        // Bắt đầu transaction
        await db.query('START TRANSACTION')

        try {
            // Tính position hiện tại dựa trên số lượng card đang có
            const [rows] = await db.query(
                'SELECT COUNT(*) AS total FROM cards WHERE column_id = ?',
                [validData.column_id]
            )
            const finalPosition = rows[0].total

            // Tạo card mới
            const query = `
                INSERT INTO cards (
                    id, board_id, column_id, title, position, description
                ) VALUES (?, ?, ?, ?, ?, ?)
            `
            const values = [id, validData.board_id, validData.column_id, validData.title, finalPosition, validData.description]

            await db.query(query, values)

            await db.query(`
                INSERT INTO card_members (card_id, user_id) VALUES (?, ?)
              `, [id, userId])

            await db.query('COMMIT')

            return {
                id,
                board_id: validData.board_id,
                column_id: validData.column_id,
                title: validData.title,
                position: finalPosition,
                description: validData.description
            }
        } catch (error) {
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

const update = async (cardId, updateData) => {
    try {
        // Lọc field không cho phép cập nhật
        Object.keys(updateData).forEach(fieldName => {
            if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
                delete updateData[fieldName]
            }
        })

        // Nếu không còn field hợp lệ nào để cập nhật
        if (Object.keys(updateData).length === 0) {
            throw new Error('No valid fields to update.')
        }

        const fields = []
        const values = []

        for (const key in updateData) {
            fields.push(`${key} = ?`)
            values.push(updateData[key])
        }

        fields.push('updated_at = CURRENT_TIMESTAMP')

        values.push(cardId)

        const query = `UPDATE cards SET ${fields.join(', ')} WHERE id = ?`
        await db.query(query, values)

        return await findOneById(cardId)
    } catch (error) {
        throw new Error(error)
    }
}

const deleteItem = async (id) => {
    try {
        const query = 'DELETE FROM cards WHERE id = ?'
        await db.query(query, [id])
        return true
    } catch (error) {
        throw new Error(error)
    }
}

const addMember = async (userId, cardId) => {
    try {
        const query = 'INSERT IGNORE INTO card_members (card_id, user_id) VALUES (?, ?)'
        await db.query(query, [cardId, userId])
    } catch (error) {
        throw new Error(error)
    }
}

const deleteMember = async (userId, cardId) => {
    try {
        const query = 'DELETE FROM card_members WHERE card_id = ? AND user_id = ?'
        await db.query(query, [cardId, userId])
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
    deleteItem,
    addMember,
    deleteMember
}