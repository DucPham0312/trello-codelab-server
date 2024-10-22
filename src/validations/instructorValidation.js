
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


const createNew = async (req, res, next) => {
  const corectCondition = Joi.object({
    instructor_name: Joi.string().required().min(3).max(50).trim().strict(),
    bio: Joi.string().required().min(3).max(255).trim().strict(),
    experience: Joi.number().required(),
    profile_image: Joi.string().required().trim().strict(),
    contact_info: Joi.object({
      email: Joi.string().email().required(),
      social_links: Joi.array().items(Joi.string()).required()
    })
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
    instructor_name: Joi.string().min(3).max(50).trim().strict(),
    bio: Joi.string().min(3).max(255).trim().strict(),
    experience: Joi.number(),
    profile_image: Joi.string().trim().strict(),
    contact_info: Joi.object({
      email: Joi.string().email(),
      social_links: Joi.array().items(Joi.string())
    }),
    courseIds: Joi.array().items(
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

export const instructorValidation = {
  createNew,
  update,
  deleteItem
}