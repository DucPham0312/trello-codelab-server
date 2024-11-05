import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { COURSE_LEVEL } from '~/utils/constants'
import { lessonModel } from '~/models/lessonModel'
import { quizModel } from '~/models/quizModel'
import { pagingSkipValue } from '~/utils/algorithms'


//Define Collection (Name & schema)
const COURSE_COLLECTION_NAME = 'Courses'
const COURSE_COLLECTION_SCHEMA = Joi.object({
  course_name: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().optional().min(3).max(256).trim().strict(),
  author: Joi.string().required().min(3).max(50).trim().strict(),
  lessons: Joi.number().integer().min(5).required(),
  duration: Joi.number().integer().min(0).required(),
  level: Joi.string().valid(COURSE_LEVEL.LEVEL1, COURSE_LEVEL.LEVEL2, COURSE_LEVEL.LEVEL3).required(),
  language: Joi.string().required().trim().strict(),
  price: Joi.alternatives().try(
    Joi.string().valid('Free').required(),
    Joi.object({
      amount: Joi.number().required(),
      currency: Joi.string().required().trim().strict(),
      discount: Joi.object({
        percentage: Joi.number().required()
      })
    })
  ),
  star: Joi.number().integer().required(),
  catalog: Joi.string().required().trim().min(3).strict(),
  course_image: Joi.string().required().trim().strict(),
  completion_certificate: Joi.boolean().required(),
  enrollment_status: Joi.string().valid('Open', 'Closed').required(),
  // memberIds: Joi.array().items(
  //   Joi.object().keys({
  //     user_Id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  //     completed: Joi.number().integer().min(0).default(0)
  //   })
  // ).default([]),
  lessonIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  //Những admin của board
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

//Chỉ định ra những field không cho phép trong hàm update()
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await COURSE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newCourseToAdd = {
      ...validData,
      ownerIds: [new ObjectId(String(userId))]
    }
    const createdCourse = await GET_DB().collection(COURSE_COLLECTION_NAME).insertOne(newCourseToAdd)
    return createdCourse
  } catch (error) { throw new Error(error) }
}

const getAllCourses = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
      //Course chưa bị xóa
      { _destroy: false },
      //userId đang thực hiện request này phải thuộc một trong 2 cái mảng ownerIds hoặc memberIds, sử dụng toán tử $all mongodb
      { $or: [
        { ownerIds: { $all: [new ObjectId(String(userId))] } },
        { memberIds: { $all: [new ObjectId(String(userId))] } }
      ] }
    ]

    const query = await GET_DB().collection(COURSE_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } }, //[] Mảng để query có gắn điều kiện đã khai báo thành biến ở trên
        //sort title theo A-Z(mặc định sẽ bị chữ B đứng trước a theo chuẩn ASCII)
        { $sort: { title: 1 } },
        //$facet để xử lí nhiều luôngf trong một query
        { $facet: {
          //Luồng 01: Query Courses
          'queryCourses': [
            { $skip: pagingSkipValue(page, itemsPerPage) }, //Bỏ qua số lượng bản ghi của những trang trước đó
            { $limit: itemsPerPage } //Giới hạn tối đa số lượng bản ghi trả về/ 1 page
          ],
          //luồng 02: Query đếm tổng tất cả số lượng bản ghi course trong db và trả về biến countedAllCourses
          'queryTotalCourses': [{ $count: 'countedAllCourses' }]
        } }
      ],
      //Thuộc tính collation locale 'en' (enghish) để fix chữ B hoa và a thường
      //https://www.mongodb.com/docs/v6.0/reference/collation/#std-label-collation-document-fields
      { collation: { locale: 'en' } }
    ).toArray()
    // console.log('query: ', query)

    const res = query[0]

    return {
      Courses: res.queryCourses || [],
      totalCourses: res.queryTotalCourses[0]?.countedAllCourses || 0
    }
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) { throw new Error(error) }
}

//Querry tổng hợp (aggregate) để lấy toàn bộ collumn và card  thuộc Board
const getDetails = async (userId, courseId) => {
  try {
    const queryConditions = [
      { _id: new ObjectId(String(courseId)) },
      { _destroy: false },
      { $or: [
        { ownerIds: { $all: [new ObjectId(String(userId))] } },
        { memberIds: { $all: [new ObjectId(String(userId))] } }
      ] }
    ]
    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      { $lookup: {
        from: lessonModel.LESSON_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'course_Id',
        as: 'Lessons'
      } },
      { $lookup: {
        from: quizModel.QUIZ_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'course_Id',
        as: 'Quizs'
      } }
    ]).toArray()

    return result[0] || {}
  } catch (error) { throw new Error(error) }
}

//Push lessonId vào cuối lessonIds
const pushLessonIds = async (lesson) => {
  try {
    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(lesson.course_Id)) },
      { $push: { lessonIds: new ObjectId(String(lesson._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

const pullLessonIds = async (lesson) => {
  try {
    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(lesson.course_Id)) },
      { $pull: { lessonIds: new ObjectId(String(lesson._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

//Update Course
const update = async (courseId, updateData) => {
  try {
    //Lọc field không cho phép cập nhật
    Object.keys(updateData).forEach( fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    //Dữ liệu từ FE liên quan ObId xử lí
    // if (updateData.lesson_id) updateData.lesson_id = new ObjectId(String(updateData.lesson_id))

    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(courseId)) },
      { $set: updateData },
      { returnDocument: 'after' } //Trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async (courseId) => {
  try {
    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).deleteOne({
      _id: new ObjectId(String(courseId))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const pullQuizIds = async (quiz) => {
  try {
    const result = await GET_DB().collection(COURSE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(quiz.course_Id)) },
      { $pull: { quizIds: new ObjectId(String(quiz._id)) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw error }
}

// const pullMemberIds = async (userId) => {
//   try {
//     const result = await GET_DB().collection(COURSE_COLLECTION_NAME).findOneAndUpdate(
//       { _id: new ObjectId(String(userId.course_Id)) },
//       { $pull: { memberIds: new ObjectId(String(userId._id)) } },
//       { returnDocument: 'after' }
//     )
//     return result
//   } catch (error) { throw error }
// }


export const courseModel = {
  COURSE_COLLECTION_NAME,
  COURSE_COLLECTION_SCHEMA,
  createNew,
  getAllCourses,
  findOneById,
  getDetails,
  pushLessonIds,
  update,
  deleteOneById,
  pullLessonIds,
  pullQuizIds
}
