
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'


const update = async (req, res, next) => {
  const corectCondition = Joi.object({
    admin: Joi.boolean(),
    role: Joi.string().valid('admin', 'instructor', 'student'),
    user_status: Joi.boolean(),
    courses_status: Joi.array().items(Joi.object({
      course_id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      progress_percentage: Joi.number().min(0).max(100),
      completion_date: Joi.date().timestamp('javascript').default(null),
      certificate_issued: Joi.boolean()
    })),
    notification_status: Joi.array().items(Joi.object({
      notification_Id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      status: Joi.boolean()
    }))
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

export const userValidation = {
  update,
  deleteItem
}