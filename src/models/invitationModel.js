import Joi from 'joi'
import db from '~/utils/db'
import { v4 as uuidv4 } from 'uuid'
import { userModel } from './userModel'
import { boardModel } from './boardModel'

// Định nghĩa schema cho invitation
const INVITATION_SCHEMA = Joi.object({
    inviter_id: Joi.string().required(),
    invited_id: Joi.string().required(),
    type: Joi.string().valid('board', 'course').required(),
    board_id: Joi.string().when('type', {
        is: 'board',
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    status: Joi.string().valid('pending', 'accepted', 'rejected').default('pending'),
    is_deleted: Joi.boolean().default(false)
})

// Kiểm tra dữ liệu trước khi tạo invitation mới
const validateBeforeCreate = async (data) => {
    return await INVITATION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
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
        if (validData.type === 'board' && validData.board_id) {
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

// Lấy tất cả invitations của một board
const findAllByBoardId = async (boardId) => {
    try {
        const query = 'SELECT * FROM invitations WHERE board_id = ? AND is_deleted = false'
        const [rows] = await db.query(query, [boardId])
        return rows
    } catch (error) {
        throw new Error(error)
    }
}

// Lấy tất cả invitations của một user (cả người mời và được mời)
const findAllByUserId = async (userId) => {
    try {
        const query = 'SELECT * FROM invitations WHERE (inviter_id = ? OR invited_id = ?) AND is_deleted = false'
        const [rows] = await db.query(query, [userId, userId])
        return rows
    } catch (error) {
        throw new Error(error)
    }
}

// Cập nhật thông tin invitation
const update = async (id, data) => {
    try {
        const validData = await validateBeforeCreate(data)
        const fields = []
        const values = []

        // Chỉ cập nhật các trường được phép
        Object.entries(validData).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'inviter_id' && key !== 'invited_id' && key !== 'created_at') {
                fields.push(`${key} = ?`)
                values.push(value)
            }
        })

        values.push(id)
        const query = `UPDATE invitations SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        await db.query(query, values)

        return await findOneById(id)
    } catch (error) {
        throw new Error(error)
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

// Xử lý khi chấp nhận invitation
const acceptInvitation = async (id) => {
    try {
        const invitation = await findOneById(id)
        if (!invitation) {
            throw new Error('Invitation not found')
        }

        // Nếu là lời mời vào board
        if (invitation.type === 'board' && invitation.board_id) {
            // Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
            await db.query('START TRANSACTION')

            try {
                // Cập nhật trạng thái invitation thành accepted
                await update(id, { status: 'accepted' })

                // Thêm user vào danh sách owner của board
                const ownerQuery = `
                    INSERT INTO board_owners (
                        board_id, user_id
                    ) VALUES (?, ?)
                `

                await db.query(ownerQuery, [invitation.board_id, invitation.invited_id])

                // Commit transaction nếu thành công
                await db.query('COMMIT')
            } catch (error) {
                // Rollback nếu có lỗi
                await db.query('ROLLBACK')
                throw error
            }
        }

        return await findOneById(id)
    } catch (error) {
        throw new Error(error)
    }
}

export const invitationModel = {
    INVITATION_SCHEMA,
    createNew,
    findOneById,
    findAllByBoardId,
    findAllByUserId,
    update,
    deleteOne,
    acceptInvitation
}
