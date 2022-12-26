import React from "react";
import Plot from "react-plotly.js";

function TopWin({ data }) {
   let assets = data["top_gain"]["details"];
   let rec = data["top_gain"]["realized_equity_change"];
   let trace = [
      {
         type: "bar",
         y: assets,
         x: rec,
         orientation: "h",
         text: assets,
         textposition: "outside",
         hovertemplate: "symbol: %{text} <br>pnl: %{x} <extra></extra>",
         cliponaxis: false,
         marker: {
            color: rec,
            // showscale: true,
            colorscale: [
               [0.0, "#e8ecf7"],
               [0.111, "#d0d9f0"],
               [0.222, "#b9c6e8"],
               [0.333, "#a1b3e1"],
               [0.444, "#8aa0d9"],
               [0.556, "#728dd1"],
               [0.667, "#5b7aca"],
               [0.778, "#4367c2"],
               [0.889, "#2c54bb"],
               [1.0, "#1441b3"],
            ],
         },
      },
   ];
   let layout = {
      title: "Top Gainers",
      showlegend: false,
      height: assets.length * 20,
      paper_bgcolor: "rgba(0, 0, 0, 0)",
      plot_bgcolor: "rgba(0, 0, 0, 0)",
      font: { color: "#7FDBFF" },
      coloraxis: { showscale: false },
      margin: { t: 40, b: 80, l: 0, r: 0 },
      xaxis: {
         showgrid: false,
         position: 0,
         anchor: "free",
         mirror: "all",
         linecolor: "gray",
         title: "total Profit $",
         showticklabels: true,
         ticks: "outside",
         range: [0, 120],
      },
      yaxis: {
         showgrid: false,
         zeroline: false,
         linecolor: "gray",
         mirror: true,
         ticks: "",
         showticklabels: false,
         // minor: { nticks: 10, tickmode: "auto" },
      },
   };

   return (
      <Plot
         className="relative max-h-screen overflow-auto"
         data={trace}
         layout={layout}
      />
   );
}

export default TopWin;
