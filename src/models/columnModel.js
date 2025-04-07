import Joi from 'joi'
import { db } from '~/utils/db'
import { v4 as uuidv4 } from 'uuid'
import { boardModel } from './boardModel'

// Định nghĩa schema cho column
const COLUMN_SCHEMA = Joi.object({
    board_id: Joi.string().required(),
    title: Joi.string().required().trim().strict(),
    position: Joi.number().integer().default(0)
})

// Kiểm tra dữ liệu trước khi tạo column mới
const validateBeforeCreate = async (data) => {
    return await COLUMN_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        
        // Kiểm tra board có tồn tại không
        const board = await boardModel.findOneById(validData.board_id)
        if (!board) {
            throw new Error('Board not found')
        }

        const id = uuidv4()

        // Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
        await db.query('START TRANSACTION')

        try {
            // Tạo column mới
            const query = `
                INSERT INTO columns (
                    id, board_id, title, position
                ) VALUES (?, ?, ?, ?)
            `

            const values = [
                id,
                validData.board_id,
                validData.title,
                validData.position
            ]

            await db.query(query, values)

            // Commit transaction nếu thành công
            await db.query('COMMIT')

            return { id, ...validData }
        } catch (error) {
            // Rollback nếu có lỗi
            await db.query('ROLLBACK')
            throw error
        }
    } catch (error) {
        throw new Error(error)
    }
}

// Tìm column theo id
const findOneById = async (id) => {
    try {
        const query = 'SELECT * FROM columns WHERE id = ?'
        const [rows] = await db.query(query, [id])
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
const update = async (id, data) => {
    try {
        const validData = await validateBeforeCreate(data)
        const fields = []
        const values = []

        // Chỉ cập nhật các trường được phép
        Object.entries(validData).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'board_id' && key !== 'created_at') {
                fields.push(`${key} = ?`)
                values.push(value)
            }
        })

        values.push(id)
        const query = `UPDATE columns SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        await db.query(query, values)

        return await findOneById(id)
    } catch (error) {
        throw new Error(error)
    }
}

// Xóa column
const deleteOne = async (id) => {
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
    deleteOne
}