import Joi from 'joi'
import { GET_DB } from '~/config/mysql'
import { v4 as uuidv4 } from 'uuid'

const COLUMN_SCHEMA = Joi.object({
    board_id: Joi.string().required(),
    title: Joi.string().required().trim().strict(),
    position: Joi.number().integer().default(0)
})

const validateBeforeCreate = async (data) => {
    return await COLUMN_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        const id = uuidv4()

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

        await GET_DB().execute(query, values)
        return { id, ...validData }
    } catch (error) {
        throw new Error(error)
    }
}

const findOneById = async (id) => {
    try {
        const query = 'SELECT * FROM columns WHERE id = ?'
        const [rows] = await GET_DB().execute(query, [id])
        return rows[0] || null
    } catch (error) {
        throw new Error(error)
    }
}

const findAllByBoardId = async (boardId) => {
    try {
        const query = 'SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC'
        const [rows] = await GET_DB().execute(query, [boardId])
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
            if (key !== 'id' && key !== 'board_id' && key !== 'created_at') {
                fields.push(`${key} = ?`)
                values.push(value)
            }
        })

        values.push(id)
        const query = `UPDATE columns SET ${fields.join(', ')} WHERE id = ?`
        await GET_DB().execute(query, values)

        return await findOneById(id)
    } catch (error) {
        throw new Error(error)
    }
}

const deleteOne = async (id) => {
    try {
        const query = 'DELETE FROM columns WHERE id = ?'
        await GET_DB().execute(query, [id])
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