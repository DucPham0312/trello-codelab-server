import Joi from 'joi'
import { GET_DB } from '~/config/mysql'
import { v4 as uuidv4 } from 'uuid'

const BOARD_SCHEMA = Joi.object({
    title: Joi.string().required().trim().strict(),
    description: Joi.string().allow(null),
    type: Joi.string().required(),
    is_deleted: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
    return await BOARD_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        const id = uuidv4()

        const query = `
            INSERT INTO boards (
                id, title, description, type, is_deleted
            ) VALUES (?, ?, ?, ?, ?)
        `

        const values = [
            id,
            validData.title,
            validData.description,
            validData.type,
            validData.is_deleted
        ]

        await GET_DB().execute(query, values)
        return { id, ...validData }
    } catch (error) {
        throw new Error(error)
    }
}

const findOneById = async (id) => {
    try {
        const query = 'SELECT * FROM boards WHERE id = ? AND is_deleted = false'
        const [rows] = await GET_DB().execute(query, [id])
        return rows[0] || null
    } catch (error) {
        throw new Error(error)
    }
}

const findAll = async () => {
    try {
        const query = 'SELECT * FROM boards WHERE is_deleted = false ORDER BY created_at DESC'
        const [rows] = await GET_DB().execute(query)
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
        await GET_DB().execute(query, values)

        return await findOneById(id)
    } catch (error) {
        throw new Error(error)
    }
}

const deleteOne = async (id) => {
    try {
        const query = 'UPDATE boards SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        await GET_DB().execute(query, [id])
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