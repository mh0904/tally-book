const STEP_LABELS = ['上传文件', '校验数据', '导入数据']

const ImportSteps = ({ activeStep }) => {
  return (
    <div className="transaction-import-steps">
      {STEP_LABELS.map((item, index) => (
        <div
          className={[
            'transaction-import-step',
            activeStep >= index ? 'active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          key={item}
        >
          <span>{index + 1}</span>
          <strong>{item}</strong>
        </div>
      ))}
    </div>
  )
}

export default ImportSteps
