
//Params socket được lấy từ thư viện socket.io
export const inviteUserToCourseSocket = (socket) => {
  //Lắng nghe event mà client emit lên có tên FE_USER_INVITED_TO_COURSE
  socket.on('FE_USER_INVITED_TO_COURSE', (invitation) => {
    //Emit ngược lại 1 event về cho mọi client (trừ client gửi request), rồi để FE check
    socket.broadcast.emit('BE_USER_INVITED_TO_COURSE', invitation)
  })
}