import React from "react";
import Plot from "react-plotly.js";

function MostTraded({ data }) {
   let assets = data["most_traded"]["details"];
   let counts = data["most_traded"]["counts"];

   let trace = [
      {
         values: counts,
         labels: assets,
         type: "pie",
         hole: 0.3,
         textposition: "inside",
         // automargin: true,
         // scalegroup: "two",
         hovertemplate:
            "symbol: %{label} <br>counts: %{value} <br> %{percent} <extra></extra>",
      },
   ];
   let layout = {
      title: "Most Traded Asset",
      paper_bgcolor: "rgba(0, 0, 0, 0)",
      plot_bgcolor: "rgba(0, 0, 0, 0)",
      font: { color: "#7FDBFF" },
      margin: { t: 60, b: 0, l: 0, r: 0 },
   };
   return <Plot data={trace} layout={layout} />;
}

export default MostTraded;
