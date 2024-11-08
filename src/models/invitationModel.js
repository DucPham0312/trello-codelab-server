import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { INVITATION_TYPES, COURSE_INVITATION_STATUS } from '~/utils/constants'
import { userModel } from '~/models/userModel'
import { courseModel } from '~/models/courseModel'


// Define Collection (name & schema)
const INVITATION_COLLECTION_NAME = 'Invitations'
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // người đi mời
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // người được mời
  type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),

  // Lời mời là course thì sẽ lưu thêm dữ liệu courseInvitation – optional
  courseInvitation: Joi.object({
    courseId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(COURSE_INVITATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNewCourseInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    // Biến đổi một số dữ liệu liên quan tới ObjectId chuẩn chỉnh
    let newInvitationToAdd = {
      ...validData,
      inviterId: new ObjectId(String(validData.inviterId)),
      inviteeId: new ObjectId(String(validData.inviteeId))
    }

    // Nếu tồn tại dữ liệu courseInvitation thì update cho cái courseId
    if (validData.courseInvitation) {
      newInvitationToAdd.courseInvitation = {
        ...validData.courseInvitation,
        courseId: new ObjectId(String(validData.courseInvitation.courseId))
      }
    }

    // Gọi insert vào DB
    const createdInvitation = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd)
    return createdInvitation
  } catch (error) { throw new Error(error) }
}

const findOneById = async (invitationId) => {
  try {
    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({ _id: new ObjectId(String(invitationId)) })
    return result
  } catch (error) { throw new Error(error) }
}

const update = async (invitationId, updateData) => {
  try {
    // Lọc những field mà chúng ta không cho phép cập nhật linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // Đối với những dữ liệu liên quan ObjectId, biến đổi ở đây
    if (updateData.courseInvitation) {
      updateData.courseInvitation = {
        ...updateData.courseInvitation,
        courseId: new ObjectId(String(updateData.courseInvitation.courseId))
      }
    }

    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(invitationId)) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const findByUser = async (userId) => {
  try {
    const queryConditions = [
      { inviteeId: new ObjectId(String(userId)) }, //Tìm theo inviteeId- người được mời thực hiện req
      { _destroy: false }
    ]
    const results = await GET_DB().collection(INVITATION_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'inviterId',
          foreignField: '_id',
          as: 'Inviter',
          // pipeline trong lookup để xử lý một hoặc nhiều luồng cần thiết
          // $project để chỉ định vài field không muốn lấy về bằng cách gán nó giá trị 0
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'inviteeId',
          foreignField: '_id',
          as: 'Invitee',
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      },
      {
        $lookup: {
          from: courseModel.COURSE_COLLECTION_NAME,
          localField: 'courseInvitation.courseId', //Thông tin course
          foreignField: '_id',
          as: 'Course'
        }
      }
    ]).toArray()

    return results
  } catch (error) { throw new Error(error) }
}

export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewCourseInvitation,
  findOneById,
  update,
  findByUser
}
