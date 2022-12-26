import React from "react";
import Plot from "react-plotly.js";

function TopLoss({ data }) {
   let assets = data["top_loss"]["details"];
   let rec = data["top_loss"]["realized_equity_change"];
   var trace = [
      {
         type: "bar",
         y: assets,
         x: rec,
         orientation: "h",
         text: assets,
         textposition: "outside",
         hovertemplate: "symbol: %{text} <br>pnl: $ %{x} <extra></extra>",
         cliponaxis: false,
         marker: {
            // cmin: 0,
            // cmax: 99.65,
            color: rec,
            // showscale: true,
            colorscale: [
               [0.0, "#c80512"],
               [0.111, "#ce1e2a"],
               [0.222, "#d33741"],
               [0.333, "#d95059"],
               [0.444, "#de6971"],
               [0.556, "#e48289"],
               [0.667, "#e99ba0"],
               [0.778, "#efb4b8"],
               [0.889, "#f4cdd0"],
               [1.0, "#fae6e7"],
            ],
         },
      },
   ];
   var layout = {
      title: "Top Losers",
      showlegend: false,
      height: assets.length * 20,
      paper_bgcolor: "rgba(0, 0, 0, 0)",
      plot_bgcolor: "rgba(0, 0, 0, 0)",
      font: { color: "#7FDBFF" },
      coloraxis: { showscale: false },
      // margin: { t: 40, b: 60, l: 10, r: 0 },
      margin: { t: 40, b: 80, l: 0, r: 0 },
      xaxis: {
         showgrid: false,
         position: 0,
         anchor: "free",
         mirror: "all",
         linecolor: "gray",
         title: "total Loss $",
         showticklabels: true,
         ticks: "outside",
         range: [-120, 0],
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
         className="relative max-h-screen overflow-y-hidden  hover:overflow-y-scroll"
         data={trace}
         layout={layout}
      />
   );
}

export default TopLoss;
