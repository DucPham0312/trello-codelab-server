
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


const createNew = async (req, res, next) => {
  const corectCondition = Joi.object({
    course_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    lesson_name: Joi.string().required().min(3).max(50).trim().strict(),
    lesson_duration: Joi.number().integer().min(0).required(),
    content: Joi.string().optional().trim().strict(),
    video_url: Joi.string().required().trim().strict(),
    rating: Joi.number().min(0).max(5).required(),
    resource_url: Joi.string().required().trim().strict()
  })

  try {
    await corectCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  const corectCondition = Joi.object({
    course_Id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    lesson_name: Joi.string().min(3).max(50).trim().strict(),
    lesson_duration: Joi.number().integer().min(0).required(),
    content: Joi.string().optional().trim().strict(),
    video_url: Joi.string().trim().strict(),
    rating: Joi.number().min(0).max(5).required(),
    resource_url: Joi.string().trim().strict(),
    quizIds: Joi.array().items(
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

export const lessonValidation = {
  createNew,
  update,
  deleteItem
}