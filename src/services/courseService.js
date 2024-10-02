/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters'
import { courseModel } from '~/models/courseModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const creatNew = async (reqBody) => {
  try {
    //Xử lý logic dữ liệu tùy đặc thù dự án
    const newCourse = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    //Gọi tới tầng Model để xử lí lưu bản ghi newCourse vào trong Database
    const createdCourse = await courseModel.createNew(newCourse)

    //Lấy bản ghi course sau khi gọi (Tùy mục đích dự án xem có cần bước này ko)
    const getNewCourse = await courseModel.findOneById(createdCourse.insertedId)

    //Làm thêm các xử lí logic khác với các COllection khác tùy đặc thù dự án...vv
    //Bắn email, notification  về cho admin khi có một cái board mới đc tạo..vv

    //Trả kết quả về ( trong Service luôn phải có return)
    return getNewCourse
  } catch (error) { throw error }
}

const getDetails = async (courseId) => {
  try {
    const course = await courseModel.getDetails(courseId)
    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found!')
    }

    return course
  } catch (error) { throw error }
}

export const courseService = {
  creatNew,
  getDetails
}