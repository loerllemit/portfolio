import React from "react";
import Plot from "react-plotly.js";

function Stats({ data }) {
   let name_list = data["name_list"];
   let val_list = data["val_list"];

   let headerColor = "grey";
   let rowEvenColor = "lightgrey";
   let rowOddColor = "white";

   let trace1 = [
      {
         type: "table",
         header: {
            values: [["<b>Parameters</b>"], ["<b>Values</b>"]],
            align: "center",
            line: { width: 1, color: "black" },
            fill: { color: headerColor },
            font: { family: "Arial", size: 14, color: "white" },
         },
         cells: {
            values: [name_list, val_list],
            align: "center",
            line: { color: "black", width: 1 },
            fill: {
               color: [
                  [
                     rowOddColor,
                     rowEvenColor,
                     rowOddColor,
                     rowEvenColor,
                     rowOddColor,
                     rowEvenColor,
                     rowOddColor,
                     rowEvenColor,
                     rowOddColor,
                     rowEvenColor,
                     rowOddColor,
                     rowEvenColor,
                     rowOddColor,
                     rowEvenColor,
                     rowOddColor,
                  ],
               ],
            },
            font: { family: "Arial", size: 14, color: ["darkslategray"] },
         },
      },
   ];
   let layout = {
      title: "Statistics",
      paper_bgcolor: "rgba(0, 0, 0, 0)",
      plot_bgcolor: "rgba(0, 0, 0, 0)",
      font: { color: "#7FDBFF" },
      // height: 600,

      // margin: { t: 60, b: 0, l: 0, r: 0 },
   };
   return <Plot data={trace1} layout={layout} />;
}

export default Stats;
