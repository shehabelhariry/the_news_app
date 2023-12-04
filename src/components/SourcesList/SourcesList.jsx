import { Checkbox, Input, Spin } from "antd";
import { useState, useEffect } from "react";
import { fetchNewsSources as fetchNewsSourcesService } from "../../services";
import "./SourcesList.css";

const SourcesList = ({ selectedSources, setSelectedSources }) => {
  const [sources, setSources] = useState([]);
  const [isSourcesLoading, setSourcesLoading] = useState(false);
  const [sourcesSearch, setSourcesSearch] = useState("");
  const fetchSources = async () => {
    setSourcesLoading(true);
    const sources = await fetchNewsSourcesService();
    setSources(sources);
    setSourcesLoading(false);
  };

  useEffect(() => {
    fetchSources();
  }, []);

  return (
    <div className="news-app__sources-list">
      <div className="news-app__sources-list__search">
        <Input
          placeholder="search for sources"
          value={sourcesSearch}
          onChange={(e) => {
            setSourcesSearch(e.target.value);
          }}
        />
        <div className="news-app__sources-list-container">
          {isSourcesLoading ? <Spin /> : null}
          {selectedSources.length > 0 && (
            <div className="news-app__sources__selected-sources">
              <h5>Selected Sources</h5>
              {selectedSources.map((selectedSource) => {
                return (
                  <div className="news-app__source" key={selectedSource}>
                    <Checkbox
                      checked={true}
                      onChange={() => {
                        setSelectedSources((selectedSourcesPrev) => {
                          return selectedSourcesPrev.filter(
                            (s) => s.id !== selectedSource.id
                          );
                        });
                      }}
                    >
                      {selectedSource.id}
                    </Checkbox>
                  </div>
                );
              })}
            </div>
          )}
          {selectedSources.length > 0 && <h5>Other Sources</h5>}
          {!isSourcesLoading &&
            sources.length > 0 &&
            sources
              .filter(
                (source) =>
                  source.id.includes(sourcesSearch) &&
                  !selectedSources.map((s) => s.id).includes(source.id)
              )
              .slice(0, 10)
              .map((source) => {
                return (
                  <div
                    className="news-app__source"
                    key={source.source + source.id}
                  >
                    <Checkbox
                      value={selectedSources.includes(source.id)}
                      onChange={(e) => {
                        setSelectedSources((selectedSources) => [
                          ...selectedSources,
                          source,
                        ]);
                      }}
                    >
                      {source.id}
                    </Checkbox>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default SourcesList;
