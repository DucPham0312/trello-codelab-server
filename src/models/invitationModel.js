import Joi from 'joi'
import db from '~/utils/db'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { v4 as uuidv4 } from 'uuid'
import { userModel } from './userModel'
import { boardModel } from './boardModel'

// Định nghĩa schema cho invitation
const INVITATION_SCHEMA = Joi.object({
    inviter_id: Joi.string().required(),
    invited_id: Joi.string().required(),
    type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),
    // Kiểm tra board_id khi type là board
    board_id: Joi.string().when('type', {
        is: INVITATION_TYPES.BOARD_INVITATION,
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS)),
    is_deleted: Joi.boolean().default(false)
})

// Kiểm tra dữ liệu trước khi tạo invitation mới
const validateBeforeCreate = async (data) => {
    return await INVITATION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const INVALID_UPDATE_FIELDS = ['id', 'inviter_id', 'invited_id', 'type', 'created_at']


const checkExistInvitee = async (boardId, userId) => {
    try {
        const [rows] = await db.query(
            'SELECT 1 FROM board_owners WHERE board_id = ? AND user_id = ? LIMIT 1',
            [boardId, userId]
        )
        return rows.length > 0
    } catch (error) {
        throw new Error(error)
    }
}


const createNewBoardInvitation = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)

        // Kiểm tra người mời có tồn tại không
        const inviter = await userModel.findOneById(validData.inviter_id)
        if (!inviter) {
            throw new Error('Inviter not found')
        }

        // Kiểm tra người được mời có tồn tại không
        const invited = await userModel.findOneById(validData.invited_id)
        if (!invited) {
            throw new Error('Invited user not found')
        }

        // Nếu là lời mời vào board, kiểm tra board có tồn tại không
        if (validData.type === INVITATION_TYPES.BOARD_INVITATION && validData.board_id) {
            const board = await boardModel.findOneById(validData.board_id)
            if (!board) {
                throw new Error('Board not found')
            }
        }

        const id = uuidv4()

        // Tạo invitation mới
        const query = `
            INSERT INTO invitations (
                id, inviter_id, invited_id, type, board_id, status, is_deleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `

        const values = [
            id,
            validData.inviter_id,
            validData.invited_id,
            validData.type,
            validData.board_id,
            validData.status,
            validData.is_deleted
        ]

        await db.query(query, values)
        return { id, ...validData }
    } catch (error) {
        throw new Error(error)
    }
}

// Tìm invitation theo id
const findOneById = async (id) => {
    try {
        const query = 'SELECT * FROM invitations WHERE id = ? AND is_deleted = false'
        const [rows] = await db.query(query, [id])
        return rows[0] || null
    } catch (error) {
        throw new Error(error)
    }
}

// Lấy tất cả invitations của một user (cả người mời và được mời)
const findAllByUserId = async (userId) => {
    try {
        const query = 'SELECT * FROM invitations WHERE invited_id = ? AND is_deleted = false'
        const [rows] = await db.query(query, [userId])
        return rows
    } catch (error) {
        throw new Error(error)
    }
}

// Cập nhật thông tin invitation
const update = async (invitedId, invitationId, updateData) => {
    const connection = await db.getConnection()

    try {
        await connection.beginTransaction()

        Object.keys(updateData).forEach(fieldName => {
            if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
                delete updateData[fieldName]
            }
        })

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
        values.push(invitationId)

        const query = `UPDATE invitations SET ${fields.join(', ')} WHERE id = ?`
        await connection.query(query, values)

        if (updateData.status === BOARD_INVITATION_STATUS.ACCEPTED) {
            const ownerQuery = `
                INSERT INTO board_owners (
                    board_id, user_id
                ) VALUES (?, ?)
            `
            await connection.query(ownerQuery, [updateData.board_id, invitedId])
        }

        await connection.commit()

        const [rows] = await connection.query(
            'SELECT * FROM invitations WHERE id = ?',
            [invitationId]
        )

        return rows[0]
    } catch (error) {
        await connection.rollback()
        throw error
    } finally {
        connection.release()
    }
}


// Xóa invitation (soft delete)
const deleteOne = async (id) => {
    try {
        const query = 'UPDATE invitations SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        await db.query(query, [id])
        return true
    } catch (error) {
        throw new Error(error)
    }
}

const deleteItem = async (id) => {
    try {
        const query = 'DELETE FROM invitations WHERE id = ?'
        await db.query(query, [id])
        return true
    } catch (error) {
        throw new Error(error)
    }
}


export const invitationModel = {
    INVITATION_SCHEMA,
    createNewBoardInvitation,
    findOneById,
    findAllByUserId,
    update,
    deleteOne,
    checkExistInvitee,
    deleteItem
}
