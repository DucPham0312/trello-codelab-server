
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


const createNew = async (req, res, next) => {
  const corectCondition = Joi.object({
    course_Id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    lesson_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    question: Joi.string().required(),
    options: Joi.array().items(Joi.string()).min(2).unique().required(),
    // answer: Joi.string().valid(Joi.in('$options')).required()
    answer: Joi.string().required()
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
    question: Joi.string(),
    options: Joi.array().items(Joi.string()).min(2).unique(),
    // answer: Joi.string().valid(Joi.in('$options'))
    answer: Joi.string()
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

export const quizValidation = {
  createNew,
  update,
  deleteItem
}