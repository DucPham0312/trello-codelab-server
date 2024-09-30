
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'


const createNew = async (req, res, next) => {
  /**
   * NOTE: Mặc định không cần phải custom message ở BE làm gì vì để cho FE tự validate và custom message phía FE cho đẹp.
   * BE chỉ cần validate Đảm Bapr Dữ Liệu Chuẩn Xác, và trả về message mặc định từ thư viện là được.
   * Quan Trọng: Việc validate dữ liệu BẮT BUỘC phải có ở BE vì đây là điểm cuối để lưu dữ liệu vào Database.
   * Và thông thường trong thực tế nên Validate dữ liệu ở cả hai phía.
   */
  const corectCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title min 3 chars',
      'string.max': 'Title max 50 chars',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    description: Joi.string().optional().min(3).max(256).trim().strict(),
    author: Joi.string().required().min(3).max(50).trim().strict(),
    duration: Joi.object({
      hours: Joi.number().integer().min(0).required(),
      minutes: Joi.number().integer().min(0).max(59).required()
    }),
    quantity: Joi.number().integer().min(10).required(),
    price: Joi.alternatives().try(
      Joi.number().min(0).required(),
      Joi.string().valid('Free').required()
    )
  })

  try {
    //Set abortEarly: False --> TH có nhiều lỗi thì trả về tất cả lỗi
    await corectCondition.validateAsync(req.body, { abortEarly: false })
    //Validate dữ liệu xong thì cho request qua Controller
    next()
  } catch (error) {
    // const errorMessage = new Error(error).message
    // const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const courseValidation = {
  createNew
}