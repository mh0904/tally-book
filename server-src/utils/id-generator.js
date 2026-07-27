const generateId = () => {
  // 时间戳（毫秒） + 3位随机数
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `${timestamp}${random.toString().padStart(3, '0')}`
}

module.exports = { generateId }
