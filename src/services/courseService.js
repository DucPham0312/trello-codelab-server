/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters'
import { courseModel } from '~/models/courseModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { lessonModel } from '~/models/lessonModel'
import { quizModel } from '~/models/quizModel'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'


const creatNew = async (userId, reqBody) => {
  try {
    //Xử lý logic dữ liệu tùy đặc thù dự án
    const newCourse = {
      ...reqBody,
      slug: slugify(reqBody.course_name)
    }

    //Gọi tới tầng Model để xử lí lưu bản ghi newCourse vào trong Database
    const createdCourse = await courseModel.createNew(userId, newCourse)

    //Lấy bản ghi course sau khi gọi (Tùy mục đích dự án xem có cần bước này ko)
    const getNewCourse = await courseModel.findOneById(createdCourse.insertedId)

    //Bắn email, notification  về cho admin khi có một cái course mới đc tạo..vv

    //Trả kết quả về ( trong Service luôn phải có return)
    return getNewCourse
  } catch (error) { throw error }
}

const getAllCourses = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    //Nếu không tồn tại page hoặc itemPerPage từ FE thì cần phải luôn gắn giá trị mặc định
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const results = await courseModel.getAllCourses(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      queryFilters
    )

    return results
  } catch (error) { throw error }
}

const getDetails = async (userId, courseId) => {
  try {
    const course = await courseModel.getDetails(userId, courseId)
    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found!')
    }

    const resCourse = cloneDeep(course)
    //đưa quiz về đúng lesson của nó
    resCourse.Lessons.forEach(lesson => {
      //Convert ObjectId về string
      // lesson.Quizs = resCourse.Quizs.filter(quiz => quiz.lesson_id.toString() === lesson._id.toString())

      //Cách 2 vì ObjectId trong MongoDB có support method .equals
      lesson.Quizs = resCourse.Quizs.filter(quiz => quiz.lesson_id.equals(lesson._id))

    })
    //Xóa quiz khỏi mảng ban đầu
    delete resCourse.Quizs

    return resCourse
  } catch (error) { throw error }
}

const update = async (courseId, reqBody, courseCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCourse = {}

    if (courseCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(courseCoverFile.buffer, 'course-covers')

      updatedCourse = await courseModel.update(courseId, {
        cover: uploadResult.secure_url
      })
    } else if (updateData.commentToAdd) {
      // Tạo dữ liệu comment để thêm vào database, cần bổ sung thêm những filed cần thiết
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }
      updatedCourse = await courseModel.unshiftNewComment(courseId, commentData)
    } else if (updateData.incomingMemberInfo) {
      //Trường hợp add hoặc remove member ra khỏi card
      updatedCourse = await courseModel.updateMembers(courseId, updateData.incomingMemberInfo)
    } else {
      //Các TH update thông tin chung
      updatedCourse = await courseModel.update(courseId, updateData)
    }

    return updatedCourse
  } catch (error) { throw error }
}

const deleteItem = async (courseId) => {
  try {
    const targetCourse = await courseModel.findOneById(courseId)
    if (!targetCourse) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found!')
    }

    await courseModel.deleteOneById(courseId)

    await lessonModel.deleteManyByCourseId(courseId)

    await quizModel.deleteManyByCourseId(courseId)

    return { deleteResult: 'Successfully!' }
  } catch (error) { throw error }
}

export const courseService = {
  creatNew,
  getAllCourses,
  getDetails,
  update,
  deleteItem
}