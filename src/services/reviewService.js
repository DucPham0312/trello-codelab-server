import { reviewModel } from '~/models/reviewModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const creatNew = async (reqBody) => {
  try {
    const newReview = {
      ...reqBody
    }
    const createdReview = await reviewModel.createNew(newReview)
    const getNewReview = await reviewModel.findOneById(createdReview.insertedId)

    if (getNewReview) {
      await userModel.pushReviewIds(getNewReview)
    }

    return getNewReview
  } catch (error) { throw error }
}

const getAllReviews = async () => {
  return await reviewModel.getAllReviews()
}

const getDetails = async (reviewId) => {
  try {
    const review = await reviewModel.getDetails(reviewId)
    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found!')
    }

    return review
  } catch (error) { throw error }
}

const update = async (review_Id, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedReview = await reviewModel.update(review_Id, updateData)

    return updatedReview
  } catch (error) { throw error }
}

const deleteItem = async (review_Id) => {
  try {
    const targetReview = await reviewModel.findOneById(review_Id)
    if (!targetReview) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found!')
    }
    //Xoa review
    await reviewModel.deleteOneById(review_Id)

    await userModel.pullReviewIds(targetReview)

    return { deleteResult: 'Delete successfully!' }
  } catch (error) { throw error }
}


export const reviewService = {
  creatNew,
  getAllReviews,
  getDetails,
  update,
  deleteItem
}