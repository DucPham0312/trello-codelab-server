import Joi from 'joi'
import db from '~/utils/db'
import { v4 as uuidv4 } from 'uuid'
import { pagingSkipValue } from '~/utils/algorithms'

const BOARD_SCHEMA = Joi.object({
    title: Joi.string().required().trim().strict(),
    description: Joi.string().trim().strict(),
    type: Joi.string().valid('public', 'private').default('public'),
    is_deleted: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
    return await BOARD_SCHEMA.validateAsync(data, { abortEarly: false })
}

const INVALID_UPDATE_FIELDS = ['id', 'createdAt']

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

const findOneById = async (boardId) => {
    try {
        const boardQuery = 'SELECT * FROM boards WHERE id = ? AND is_deleted = false'
        const [boardRows] = await db.query(boardQuery, [boardId])

        return boardRows[0] || null

    } catch (error) {
        throw new Error(error)
    }
}

const getAllBoards = async (userId, page, itemsPerPage, queryFilters) => {
    try {
        // Lấy danh sách boards mà user có quyền truy cập (DISTINCT: loại bỏ bản ghi trùng)
        let query = `
        SELECT DISTINCT b.*
        FROM boards b
        INNER JOIN board_owners bo ON b.id = bo.board_id 
        WHERE b.is_deleted = false
        AND bo.user_id = ?
      `
        const values = [userId]

        // Nếu có từ khóa tìm kiếm, thêm điều kiện lọc theo title hoặc description
        if (queryFilters && queryFilters.title) {
            query += ' AND (b.title LIKE ? OR b.description LIKE ?)'
            values.push(`%${queryFilters.title}%`, `%${queryFilters.title}%`)
        }

        // Sắp xếp theo thời gian tạo giảm dần
        query += ' ORDER BY b.created_at DESC'

        // Thêm phân trang: LIMIT và OFFSET
        const offset = pagingSkipValue(page, itemsPerPage)
        query += ' LIMIT ? OFFSET ?'
        values.push(itemsPerPage, offset)

        // Thực thi truy vấn lấy danh sách boards phân trang
        const [boards] = await db.query(query, values)

        // Truy vấn lấy tổng số lượng boards (phục vụ phân trang)
        let countQuery = `
        SELECT COUNT(DISTINCT b.id) as total
        FROM boards b
        INNER JOIN board_owners bo ON b.id = bo.board_id
        WHERE b.is_deleted = false 
        AND bo.user_id = ?
      `
        const countValues = [userId]

        // Nếu có filter thì thêm điều kiện tương ứng trong truy vấn đếm
        if (queryFilters && queryFilters.title) {
            countQuery += ' AND (b.title LIKE ? OR b.description LIKE ?)'
            countValues.push(`%${queryFilters.title}%`, `%${queryFilters.title}%`)
        }

        // Thực thi truy vấn đếm tổng số lượng boards
        const [totalCount] = await db.query(countQuery, countValues)

        // Trả về kết quả gồm danh sách boards và metadata phân trang
        return {
            boards,
            meta: {
                page: page,
                itemsPerPage: itemsPerPage,
                totalItems: totalCount[0].total,
                totalPages: Math.ceil(totalCount[0].total / itemsPerPage)
            }
        }

    } catch (error) {
        throw new Error(error)
    }
}


const update = async (boardId, updateData) => {
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

        values.push(boardId)

        const query = `UPDATE boards SET ${fields.join(', ')} WHERE id = ?`
        await db.query(query, values)

        return await findOneById(boardId)
    } catch (error) {
        throw new Error(error)
    }
}


const deleteSoftOne = async (id) => {
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
    getAllBoards,
    update,
    deleteSoftOne
}