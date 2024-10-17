import express from 'express'
import { firebaseModel } from '~/models/firebaseModel'

const Router = express.Router()
Router.route('/')
  .post(firebaseModel.saveUsersToMongoDB)

export const saveUserToMG = Router
