import { StatusCodes } from 'http-status-codes'
import { reviewService } from '~/services/reviewService'

const createNew = async (req, res, next) => {
  try {
    const createdReview = await reviewService.creatNew(req.body)
    res.status(StatusCodes.CREATED).json(createdReview)
  } catch (error) { next(error) }
}

const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getAllReviews()
    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(reviews)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    // console.log('req.params: ', req.params)
    const reviewId = req.params.id

    const review = await reviewService.getDetails(reviewId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(review)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const reviewId = req.params.id
    const updatedReview = await reviewService.update(reviewId, req.body)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedReview)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const reviewId = req.params.id
    const result = await reviewService.deleteItem(reviewId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const reviewController = {
  createNew,
  getAllReviews,
  getDetails,
  update,
  deleteItem
}