import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const LESSON_COLLECTION_NAME = 'lessons'
const LESSON_COLLECTION_SCHEMA = Joi.object({
  courseId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),
  content: Joi.string().optional().trim().strict(),

  documentIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

export const lessonModel = {
  LESSON_COLLECTION_NAME,
  LESSON_COLLECTION_SCHEMA
}