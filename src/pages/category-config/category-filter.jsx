import { Checkbox, Radio } from 'antd'
import { CATEGORY_TYPES } from './category-utils'

const CategoryFilter = ({
  activeType,
  onShowHiddenChange,
  onTypeChange,
  showHidden,
}) => {
  return (
    <div className="category-config-filter">
      <Radio.Group
        buttonStyle="solid"
        onChange={(event) => onTypeChange(event.target.value)}
        optionType="button"
        options={CATEGORY_TYPES.map((type) => ({
          label: `${type}类型`,
          value: type,
        }))}
        value={activeType}
      />
      <Checkbox
        checked={showHidden}
        onChange={(event) => onShowHiddenChange(event.target.checked)}
      >
        显示已隐藏的分类
      </Checkbox>
    </div>
  )
}

export default CategoryFilter
