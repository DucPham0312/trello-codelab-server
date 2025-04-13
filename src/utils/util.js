import db from '~/utils/db'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { PERMISSION_TYPE } from '~/utils/constants'

const isAdmin = async (userId) => {
    const [[user]] = await db.query('SELECT role FROM users WHERE id = ?', [userId])
    if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'User from isAdmin not found')
    }
    return user.role === 'admin'
}

const checkStatus = async (userId, boardId) => {
    const boardQuery = `
        SELECT b.status, b.created_by 
        FROM boards b
        WHERE b.id = ?
    `
    const [rows] = await db.query(boardQuery, [boardId])

    if (!rows.length) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    const board = rows[0]

    if (board.status === 'private' && board.created_by !== userId) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to access this private board')
    }
}

const checkBoardPermission = async (userId, boardId, permissionType = PERMISSION_TYPE.READ) => {
    if (await isAdmin(userId)) return

    if (permissionType === PERMISSION_TYPE.WRITE) {
        await checkStatus(userId, boardId)
    }

    const ownerQuery = `
        SELECT * FROM board_owners 
        WHERE board_id = ? AND user_id = ?
    `
    const [ownerRows] = await db.query(ownerQuery, [boardId, userId])

    // Nếu không phải owner thì không có quyền truy cập
    if (!ownerRows.length) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to view or edit this board')
    }
}


export const util = {
    checkBoardPermission
}
