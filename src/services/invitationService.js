import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'
import { util } from '~/utils/util'


const createNewBoardInvitation = async (reqBody, inviterId) => {
    try {
        // Người đi mời: là người đang request
        const inviter = await userModel.findOneById(inviterId)
        // Người được mời: theo email nhận từ FE
        const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
        // Tìm board để xử lý
        const board = await boardModel.findOneById(reqBody.boardId)

        // Nếu không tồn tại 1 trong 3 thì reject
        if (!invitee || !inviter || !board) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
        }

        await util.checkBoardPermission(inviterId, reqBody.boardId)

        // newData
        const newInvitationData = {
            inviter_id: inviterId,
            invited_id: invitee.id.toString(),
            type: INVITATION_TYPES.BOARD_INVITATION,
            board_id: board.id.toString(),
            status: BOARD_INVITATION_STATUS.PENDING
        }

        const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
        const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

        // Ngoài thông tin của board invitation mới tạo, trả về cả board, inviter, invitee cho FE xử lý.
        const resInvitation = {
            ...getInvitation,
            board,
            inviter: pickUser(inviter),
            invitee: pickUser(invitee)
        }

        return resInvitation
    } catch (error) { throw error }
}

const getInvitations = async (userId) => {
    try {
        const getInviations = await invitationModel.findAllByUserId(userId)

        //Giá trị data inviter, invitee và board trả về ở dạng mảng 1 phần tử --> biến đổi về JSON Object trước khi trả về FE
        const resInvitations = getInviations.map(i => {
            return {
                ...i,
                Inviter: i.inviter_id[0] || {},
                Invitee: i.invited_id[0] || {},
                Board: i.board_id[0] || {}
            }
        })

        return resInvitations
    } catch (error) { throw error }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
    try {
        // Tìm bản ghi invitation
        const getInvitation = await invitationModel.findOneById(invitationId)
        if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')

        // check board
        const boardId = getInvitation.board_id
        const getBoard = await boardModel.findOneById(boardId)
        if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')

        // Kiểm tra nếu status là ACCEPTED join board mà user (invitee) đã là owner hoặc member của board rồi thì trả về thông báo lỗi.
        const isMember = await invitationModel.checkExistInvitee(boardId, getInvitation.invited_id)
        if (status === BOARD_INVITATION_STATUS.ACCEPTED && isMember) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this board.')
        }

        //Tạo data đẻ update bản ghi Invitation
        const updateData = {
            board_id: boardId,
            status: status
        }

        const updatedInvitation = await invitationModel.update(getInvitation.invited_id, invitationId, updateData)

        return updatedInvitation
    } catch (error) { throw error }
}

const findOneById = async (invitationId) => {
    try {
        const getInvitation = await invitationModel.findOneById(invitationId)
        return getInvitation
    } catch (error) { throw error }
}

const deleteItems = async (ids) => {
    try {
        const results = []
        for (const invitationId of ids) {

            const invitation = await invitationModel.findOneById(invitationId)

            if (!invitation) {
                results.push({ message: `Invitation with id ${invitationId} not found!` })
                continue
            }

            await invitationModel.deleteItem(invitationId)
            results.push({ message: 'Deleted successfully!' })
        }

        return results
    } catch (error) {
        throw new Error(error)
    }
}

export const invitationService = {
    createNewBoardInvitation,
    getInvitations,
    updateBoardInvitation,
    findOneById,
    deleteItems
}
