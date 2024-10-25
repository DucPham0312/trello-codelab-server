import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'


const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers()
    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(users)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    // console.log('req.params: ', req.params)
    const userId = req.params.id

    const user = await userService.getDetails(userId)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(user)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const userId = req.params.id
    const updatedUser = await userService.update(userId, req.body)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) { next(error) }
}


const deleteManyUsers= async(req, res, next) => {
  try {
    const userIds = req.body.userIds // Nhận mảng userIds từ body request
    const result = await userService.deleteManyUsers(userIds)

    //Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const userController = {
  getAllUsers,
  getDetails,
  update,
  deleteManyUsers
}