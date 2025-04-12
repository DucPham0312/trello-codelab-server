import Joi from 'joi'
import db from '~/utils/db'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'
import { v4 as uuidv4 } from 'uuid'



//Define 2 roles for user
const USER_ROLES = {
    CLIENT: 'client',
    ADMIN: 'admin'
}

//Define Schema
const USER_SCHEMA = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
    username: Joi.string().trim().strict().allow(null),
    display_name: Joi.string().trim().strict().allow(null),
    avatar: Joi.string().allow(null),
    role: Joi.string().valid(USER_ROLES.CLIENT, USER_ROLES.ADMIN).default(USER_ROLES.CLIENT),
    is_active: Joi.boolean().default(false),
    verify_token: Joi.string()
})

const INVALID_UPDATE_FIELDS = ['id', 'email', 'username', 'updated_at']

const validateBeforeCreate = async (data) => {
    return await USER_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        const id = uuidv4()

        const query = `
            INSERT INTO users (
                id, email, password, username, display_name, avatar, role, is_active, verify_token
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `

        const values = [
            id,
            validData.email,
            validData.password,
            validData.username,
            validData.display_name,

            validData.avatar,
            validData.role,
            validData.is_active,
            validData.verify_token
        ]

        await db.query(query, values)
        return { id, ...validData }
    } catch (error) {
        throw new Error(error)
    }
}

const findOneById = async (id) => {
    try {
        const query = 'SELECT * FROM users WHERE id = ?'
        const [rows] = await db.query(query, [id])
        return rows[0] || null
    } catch (error) {
        throw new Error(error)
    }
}

const findOneByEmail = async (email) => {
    try {
        const query = 'SELECT * FROM users WHERE email = ?'
        const [rows] = await db.query(query, [email])
        return rows[0] || null
    } catch (error) {
        throw new Error(error)
    }
}

const update = async (userId, updateData) => {
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

        values.push(userId)

        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
        await db.query(query, values)

        return await findOneById(userId)
    } catch (error) {
        throw new Error(error)
    }
}

export default update


const deleteOne = async (id) => {
    try {
        const query = 'UPDATE users SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        await db.query(query, [id])
        return true
    } catch (error) {
        throw new Error(error)
    }
}

export const userModel = {
    USER_ROLES,
    USER_SCHEMA,
    createNew,
    findOneById,
    findOneByEmail,
    update,
    deleteOne
}