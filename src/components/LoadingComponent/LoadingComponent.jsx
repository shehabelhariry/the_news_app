import { Card, Col } from "antd";
import Meta from "antd/es/card/Meta";
import React from "react";

const LoadingComponent = () => {
  return Array.from({ length: 12 })
    .fill("")
    .map(() => {
      return (
        <Col span={8}>
          <Card
            loading={true}
            className="news-app__card"
            cover={
              <img
                className="news-app__card__img"
                alt="article cover"
                src={
                  "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg"
                }
              />
            }
          >
            <Meta title={"loading"} description={"loading"} />
            <p>
              <b>Published at:</b> {"loading"}
            </p>
          </Card>
        </Col>
      );
    });
};

export default LoadingComponent;
