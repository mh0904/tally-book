// src/pages/Transactions.js
import { useState, useEffect } from 'react'

const Transactions = () => {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    fetch('http://localhost:5000/transactions')
      .then((res) => res.json())
      .then((data) => setTransactions(data))
  }, [])

  return (
    <div>
      <ul>
        {transactions?.map((item) => (
          <li key={item.id}>
            {item.date}：{item.description}（
            {item.type === 'income' ? '收入' : '支出'} {item.amount}元） 分类：
            {item.classification}
          </li>
        ))}
      </ul>
    </div>
  )
}
export default Transactions
