import { Radio } from "antd";
import "./CategorySelector.css";

const CategorySelector = ({ onChange }) => {
  const categories = [
    { value: "", label: "All" },
    { value: "business", label: "Business" },
    { value: "entertainment", label: "Entertainment" },
    { value: "general", label: "General" },
    { value: "health", label: "Health" },
    { value: "science", label: "Science" },
    { value: "sports", label: "Sports" },
  ];
  return (
    <div className="news-app__categories-overflow">
      <Radio.Group
        onChange={(e) => onChange(e.target.value)}
        defaultValue=""
        style={{ marginTop: 16 }}
      >
        {categories.map((category) => {
          return (
            <Radio.Button key={category.value} value={category.value}>
              {category.label}
            </Radio.Button>
          );
        })}
      </Radio.Group>
    </div>
  );
};

export default CategorySelector;
