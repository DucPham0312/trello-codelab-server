/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters'
import { courseModel } from '~/models/courseModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { lessonModel } from '~/models/lessonModel'
import { quizModel } from '~/models/quizModel'

const creatNew = async (reqBody) => {
  try {
    //Xử lý logic dữ liệu tùy đặc thù dự án
    const newCourse = {
      ...reqBody,
      slug: slugify(reqBody.course_name)
    }

    //Gọi tới tầng Model để xử lí lưu bản ghi newCourse vào trong Database
    const createdCourse = await courseModel.createNew(newCourse)

    //Lấy bản ghi course sau khi gọi (Tùy mục đích dự án xem có cần bước này ko)
    const getNewCourse = await courseModel.findOneById(createdCourse.insertedId)

    //Làm thêm các xử lí logic khác với các COllection khác tùy đặc thù dự án...vv
    //Bắn email, notification  về cho admin khi có một cái course mới đc tạo..vv

    //Trả kết quả về ( trong Service luôn phải có return)
    return getNewCourse
  } catch (error) { throw error }
}

const getAllCourses = async () => {
  return await courseModel.getAllCourses()
}

const getDetails = async (courseId) => {
  try {
    const course = await courseModel.getDetails(courseId)
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

const update = async (courseId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedCourse = await courseModel.update(courseId, updateData)

    return updatedCourse
  } catch (error) { throw error }
}

const deleteItem = async (courseId) => {
  try {
    //xóa course
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