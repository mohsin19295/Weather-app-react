import React from "react";
import { ResponsiveContainer, Line, LineChart } from "recharts";

const myData = [
  { id: 1, value: 100 },
  { id: 2, value: 800 },
  { id: 3, value: 500 },
  { id: 4, value: 400 },
  { id: 5, value: 150 },
];

const Chart = () => {
  return (
    <>
      <ResponsiveContainer width="100%" aspect={3}>
        <LineChart data={myData}>
          <Line dataKey="value"></Line>
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default Chart;
