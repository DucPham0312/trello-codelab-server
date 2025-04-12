import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { INVITATION_TYPES, COURSE_INVITATION_STATUS } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const createNewCourseInvitation = async (reqBody, inviterId) => {
    try {
        // Người đi mời: chính là người đang request, nên tìm theo id lấy từ token
        const inviter = await userModel.findOneById(inviterId)
        // Người được mời: lấy theo email nhận từ phía FE
        const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
        // Tìm luôn cái course ra để lấy data xử lý
        const course = await boardModel.findOneById(reqBody.courseId)

        // Nếu không tồn tại 1 trong 3 thì cứ thẳng tay reject
        if (!invitee || !inviter || !course) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Course not found!')
        }

        // Tạo data cần thiết để lưu vào trong DB
        const newInvitationData = {
            inviterId,
            inviteeId: invitee.id.toString(), //chuyển từ ObjectId về String vì qua Model cí check lại ở create
            type: INVITATION_TYPES.COURSE_INVITATION,
            courseInvitation: {
                courseId: course.id.toString(),
                status: COURSE_INVITATION_STATUS.PENDING
            }
        }

        // Gọi sang Model để lưu vào DB
        const createdInvitation = await invitationModel.createNewCourseInvitation(newInvitationData)
        const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

        // Ngoài thông tin của course invitation mới tạo thì trả về cả luôn course, inviter, invitee cho FE xử lý.
        const resInvitation = {
            ...getInvitation,
            course,
            inviter: pickUser(inviter),
            invitee: pickUser(invitee)
        }

        return resInvitation
    } catch (error) { throw error }
}

const getInvitations = async (userId) => {
    try {
        const getInviations = await invitationModel.findByUser(userId)
        // console.log('getInviations', getInviations)

        //Giá trị data inviter, invitee và course trả về ở dạng mảng 1 phần tử --> biến đổi về JSON Object trước khi trả về FE
        const resInvitations = getInviations.map(i => {
            return {
                ...i,
                Inviter: i.Inviter[0] || {},
                Invitee: i.Invitee[0] || {},
                Course: i.Course[0] || {}
            }
        })

        return resInvitations
    } catch (error) { throw error }
}

const updateCourseInvitation = async (userId, invitationId, status) => {
    try {
        // Tìm bản ghi invitation trong model
        const getInvitation = await invitationModel.findOneById(invitationId)
        if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')

        // Khi có Invitation --> lấy full thông tin của course
        const courseId = getInvitation.courseInvitation.courseId
        const getCourse = await boardModel.findOneById(courseId)
        if (!getCourse) throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found!')

        // Kiểm tra nếu status là ACCEPTED join course mà user (invitee) đã là owner hoặc member của course rồi thì trả về thông báo lỗi.
        // Note: 2 mảng memberIds và ownerIds của course đang là kiểu dữ liệu ObjectId nên cho về String để check
        const courseOwnerAndMemberIds = [...getCourse.ownerIds, ...getCourse.memberIds].toString()
        if (status === COURSE_INVITATION_STATUS.ACCEPTED && courseOwnerAndMemberIds.includes(userId)) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member of this course.')
        }

        //Tạo data đẻ update bản ghi Invitation
        const updateData = {
            courseInvitation: {
                ...getInvitation.courseInvitation,
                status: status
            }
        }

        //Bước 1: Cập nhật status trong bản ghi Invitation (reject)
        const updatedInvitation = await invitationModel.update(invitationId, updateData)

        //Bước 2: Nếu trường hợp Accept lời mời thành công, thêm thông tin của userId vào bản ghi memberIds trong course.
        if (updatedInvitation.courseInvitation.status === COURSE_INVITATION_STATUS.ACCEPTED) {
            await boardModel.pushMemberIds(courseId, userId)
        }

        return updatedInvitation
    } catch (error) { throw error }
}

export const invitationService = {
    createNewCourseInvitation,
    getInvitations,
    updateCourseInvitation
}
