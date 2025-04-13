import Joi from 'joi'
import db from '~/utils/db'
import { v4 as uuidv4 } from 'uuid'
import { boardModel } from './boardModel'

// Định nghĩa schema cho column
const COLUMN_SCHEMA = Joi.object({
    board_id: Joi.string().required(),
    title: Joi.string().required().trim().strict()
})

// Kiểm tra dữ liệu trước khi tạo column mới
const validateBeforeCreate = async (data) => {
    return await COLUMN_SCHEMA.validateAsync(data, { abortEarly: false })
}

const INVALID_UPDATE_FIELDS = ['id', 'board_id', 'created_at']

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)

        const board = await boardModel.findOneById(validData.board_id)
        if (!board) {
            throw new Error('Board not found')
        }

        const id = uuidv4()

        // Bắt đầu transaction
        await db.query('START TRANSACTION')

        try {
            // Tính position hiện tại dựa trên số lượng column đang có
            const [rows] = await db.query(
                'SELECT COUNT(*) AS total FROM columns WHERE board_id = ?',
                [validData.board_id]
            )
            const finalPosition = rows[0].total

            // Tạo column mới
            const query = `
                INSERT INTO columns (
                    id, board_id, title, position
                ) VALUES (?, ?, ?, ?)
            `
            const values = [id, validData.board_id, validData.title, finalPosition]

            await db.query(query, values)

            await db.query('COMMIT')

            return {
                id,
                board_id: validData.board_id,
                title: validData.title,
                position: finalPosition
            }
        } catch (error) {
            await db.query('ROLLBACK')
            throw error
        }
    } catch (error) {
        throw new Error(error)
    }
}


const findOneById = async (columnId) => {
    try {
        const query = 'SELECT * FROM columns WHERE id = ?'
        const [rows] = await db.query(query, [columnId])
        return rows[0] || null
    } catch (error) {
        throw new Error(error)
    }
}

// Lấy tất cả columns của một board
const findAllByBoardId = async (boardId) => {
    try {
        const query = 'SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC'
        const [rows] = await db.query(query, [boardId])
        return rows
    } catch (error) {
        throw new Error(error)
    }
}

// Cập nhật thông tin column
const update = async (columnId, updateData) => {
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

        values.push(columnId)

        const query = `UPDATE columns SET ${fields.join(', ')} WHERE id = ?`
        await db.query(query, values)

        return await findOneById(columnId)
    } catch (error) {
        throw new Error(error)
    }
}

// Xóa column
const deleteItems = async (id) => {
    try {
        const query = 'DELETE FROM columns WHERE id = ?'
        await db.query(query, [id])
        return true
    } catch (error) {
        throw new Error(error)
    }
}

export const columnModel = {
    COLUMN_SCHEMA,
    createNew,
    findOneById,
    findAllByBoardId,
    update,
    deleteItems
}