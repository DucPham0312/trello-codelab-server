import { firebaseService } from '~/services/firebaseService'
import { StatusCodes } from 'http-status-codes'

const getAllUsers = async (req, res) => {
  try {
    const dataUsers = await firebaseService.getAllUsersFromFirestore()
    res.status(StatusCodes.OK).json(dataUsers)
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message })
  }
}


export const firebaseController = {
  getAllUsers
}