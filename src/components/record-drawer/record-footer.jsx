import { Button } from 'antd'

const RecordFooter = ({ saving, onSave, onSaveAgain }) => {
  return (
    <footer className="record-footer">
      <Button loading={saving} onClick={onSave} type="primary">
        保存
      </Button>
      <Button loading={saving} onClick={onSaveAgain}>
        保存并再记
      </Button>
    </footer>
  )
}

export default RecordFooter
