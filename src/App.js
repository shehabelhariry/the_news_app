import "./App.css";
import { useEffect, useState } from "react";
import { getAggregatedArticles } from "./services";
import {
  Row,
  Col,
  Card,
  Input,
  DatePicker,
  Button,
  Drawer,
  Flex,
  Empty,
} from "antd";
import Meta from "antd/es/card/Meta";
import LoadingComponent from "./components/LoadingComponent/LoadingComponent";
import SourcesList from "./components/SourcesList/SourcesList";
import debounce from "lodash/debounce";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import CategorySelector from "./components/CategorySelector/CategorySelector";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState();
  const [category, setCategory] = useState("");
  const [visible, setVisible] = useState(false);

  const [selectedSources, setSelectedSources] = useState([]);

  const fetchArticles = async ({ keyword, date, category, sources } = {}) => {
    setIsLoading(true);
    setArticles([]);
    const aggregatedArticles = await getAggregatedArticles({
      keyword,
      date,
      category,
      sources,
    });
    setArticles(aggregatedArticles);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchArticles({
      keyword: search,
      date,
      category,
      sources: selectedSources,
    });
  }, [selectedSources, category, date, search]);

  return (
    <div className="App">
      <div className="news-app__nav">
        <h1>The News App</h1>
      </div>
      <Flex justify="center">
        <CategorySelector
          onChange={(category) => setCategory(category)}
          category={category}
        />
      </Flex>
      <Flex justify="center" className="news-app__search-container">
        <Input
          className="news-app__search"
          placeholder="Search for topics, people and events"
          onChange={debounce((e) => {
            setSearch(e.target.value);
          }, 1000)}
          suffix={<SearchOutlined />}
        />
        <Button type="ghost" onClick={() => setVisible(true)}>
          <FilterOutlined />
        </Button>
      </Flex>
      <div className="news-app__layout">
        <Row gutter={24}>
          <Col span={24}>
            <div className="news-app__cards-container">
              <Row gutter={24}>
                {isLoading ? <LoadingComponent /> : null}
                {articles.length > 0 ? (
                  articles.map((article, index) => {
                    return (
                      <Col
                        xs={24}
                        sm={8}
                        md={8}
                        lg={8}
                        xl={8}
                        key={article.title + index}
                      >
                        <a
                          href={article.sourceUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <Card
                            className="news-app__card"
                            cover={
                              <img
                                className="news-app__card__img"
                                alt="article cover"
                                src={
                                  article.img ||
                                  "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg"
                                }
                              />
                            }
                          >
                            <Meta
                              title={article.title}
                              description={article.newsSource}
                            />
                            <p>
                              <b>Published at:</b> {article.date}
                            </p>
                            {article.author ? <p>by {article.author}</p> : null}
                          </Card>
                        </a>
                      </Col>
                    );
                  })
                ) : (
                  <Flex justify="center" flex={1}>
                    <Empty description="No matches yet, modify your search" />
                  </Flex>
                )}
              </Row>
            </div>
          </Col>
        </Row>
        <Drawer
          open={visible}
          onClose={() => setVisible(false)}
          title="Advanced Filters"
        >
          <div className="drawer-container">
            <Flex vertical className="drawer-container__section">
              <h4 className="drawer-container__section__title">
                Filter by dates later than:
              </h4>
              <DatePicker
                className="news-app__search-section__date-select"
                onChange={(__, dateString) => {
                  setDate(dateString);
                }}
              />
            </Flex>
            <Flex vertical className="drawer-container__section">
              <h4 className="drawer-container__section__title">
                Search & Filter by sources
              </h4>
              <SourcesList
                selectedSources={selectedSources}
                setSelectedSources={setSelectedSources}
              />
            </Flex>
          </div>
        </Drawer>
      </div>
    </div>
  );
}

export default App;
