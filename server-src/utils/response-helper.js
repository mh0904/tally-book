const buildMessage = (message, error) => {
  if (!error?.message) {
    return message
  }

  return `${message}：${error.message}`
}

const sendResponse = (res, { code = 200, data = null, msg = '', status }) => {
  const httpStatus = status || code
  return res.status(httpStatus).json({ code, data, msg })
}

const sendSuccess = (res, data = null, msg = '操作成功') => {
  return sendResponse(res, {
    code: 200,
    data,
    msg,
  })
}

const sendFail = (res, msg, status = 400, data = null) => {
  return sendResponse(res, {
    code: status,
    data,
    msg,
    status,
  })
}

const sendError = (res, msg, error, status = 500) => {
  return sendResponse(res, {
    code: status,
    data: null,
    msg: buildMessage(msg, error),
    status,
  })
}

module.exports = {
  sendError,
  sendFail,
  sendResponse,
  sendSuccess,
}
