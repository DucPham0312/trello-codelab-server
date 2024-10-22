
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { COURSE_LEVEL } from '~/utils/variable'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


const createNew = async (req, res, next) => {
  const corectCondition = Joi.object({
    instructor_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    course_name: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title min 3 chars',
      'string.max': 'Title max 50 chars',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
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
    enrollment_status: Joi.string().valid('Open', 'Closed').required()
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

const update = async (req, res, next) => {
  const corectCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().optional().min(3).max(256).trim().strict(),
    author: Joi.string().min(3).max(50).trim().strict(),
    catalog: Joi.string().trim().min(3).strict(),
    level: Joi.string().valid(COURSE_LEVEL.LEVEL1, COURSE_LEVEL.LEVEL2, COURSE_LEVEL.LEVEL3),
    lessons: Joi.number().integer().min(5),
    duration: Joi.object({
      hours: Joi.number().integer().min(0),
      minutes: Joi.number().integer().min(0).max(59)
    }),
    price: Joi.alternatives().try(
      Joi.number().min(0),
      Joi.string().valid('Free')
    ),
    lessonIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([])
  })

  try {
    await corectCondition.validateAsync(req.body, {
      abortEarly: false,
      //Không cần đẩy 1 số field lên
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const deleteItem = async (req, res, next) => {
  const corectCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })
  try {
    await corectCondition.validateAsync(req.params)
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const courseValidation = {
  createNew,
  update,
  deleteItem
}