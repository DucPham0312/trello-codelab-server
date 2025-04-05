import multer from 'multer'
import { LIMIT_COMMON_FILE_SIZE, ALLOW_COMMON_FILE_TYPES } from '~/utils/validators'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// Function Kiểm tra loại file
const customFileFilter = (req, file, callback) => {
    // console.log('Multer File: ', file)

    //Đối với multer kiểm tra kiểu file thì sử dụng mimetype
    if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
        const errMessage = 'File type is invalid. Only accept jpg, jpeg and png.'
        return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
    }

    //Nếu kiểu file hợp lệ
    return callback(null, true)
}

//Khởi tạo function upload được bọc bởi multer
const upload = multer({
    limits: { fieldSize: LIMIT_COMMON_FILE_SIZE },
    fileFilter: customFileFilter
})

export const multerUploadMiddleware = {
    upload
}