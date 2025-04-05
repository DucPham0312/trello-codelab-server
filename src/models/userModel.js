import Joi from 'joi'
import { GET_DB } from '~/config/mysql'
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
    verify_token: Joi.string().allow(null),
    metadata: Joi.object().allow(null)
})

const validateBeforeCreate = async (data) => {
    return await USER_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        const id = uuidv4()

        const query = `
            INSERT INTO users (
                id, email, password, username, display_name, 
                avatar, role, is_active, verify_token, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            validData.verify_token,
            validData.metadata ? JSON.stringify(validData.metadata) : null
        ]

        const [result] = await GET_DB().execute(query, values)
        return { id, ...validData }
    } catch (error) {
        throw new Error(error)
    }
}

const findOneById = async (id) => {
    try {
        const query = 'SELECT * FROM users WHERE id = ?'
        const [rows] = await GET_DB().execute(query, [id])
        return rows[0] || null
    } catch (error) {
        throw new Error(error)
    }
}

const findOneByEmail = async (email) => {
    try {
        const query = 'SELECT * FROM users WHERE email = ?'
        const [rows] = await GET_DB().execute(query, [email])
        return rows[0] || null
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
            if (key !== 'id' && key !== 'email' && key !== 'created_at') {
                fields.push(`${key} = ?`)
                values.push(value)
            }
        })

        values.push(id)
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
        await GET_DB().execute(query, values)

        return await findOneById(id)
    } catch (error) {
        throw new Error(error)
    }
}

export const userModel = {
    USER_SCHEMA,
    createNew,
    findOneById,
    findOneByEmail,
    update
}