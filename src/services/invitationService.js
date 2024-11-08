import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { courseModel } from '~/models/courseModel'
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
    const course = await courseModel.findOneById(reqBody.courseId)

    // Nếu không tồn tại 1 trong 3 thì cứ thẳng tay reject
    if (!invitee || !inviter || !course) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Course not found!')
    }

    // Tạo data cần thiết để lưu vào trong DB
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), //chuyển từ ObjectId về String vì qua Model cí check lại ở create
      type: INVITATION_TYPES.COURSE_INVITATION,
      courseInvitation: {
        courseId: course._id.toString(),
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
    const getInviations= await invitationModel.findByUser(userId)
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

export const invitationService = {
  createNewCourseInvitation,
  getInvitations
}
