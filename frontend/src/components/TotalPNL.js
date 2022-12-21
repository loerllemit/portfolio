import React from "react";
import Plot from "react-plotly.js";
import buttonOptions from "../utils/buttonOptions";
import config from "../utils/Config";

function TotalPNL({ data, width, height }) {
   let start_bal = data["start_bal"];
   let date = data["daily_pnl"]["date"];
   let pnl = data["daily_pnl"]["capital"];
   let pct_pnl = data["daily_pnl"]["pct_pnl"];

   let trace1 = {
      x: date,
      y: pnl,
      modes: "lines",
      name: "nominal",
      hovertemplate: "date: %{x} <br>equity: %{y:$.2f} <extra></extra>",
   };
   let trace2 = {
      x: date,
      y: pct_pnl,
      modes: "lines",
      name: "percent",
      yaxis: "y2",
      hovertemplate: "date: %{x} <br>% pnl: %{y:.2f} <extra></extra>",
   };
   let layout = {
      title: "Total Realized Equity",
      showlegend: true,
      height: height,
      width: width,
      paper_bgcolor: "rgba(0, 0, 0, 0)",
      plot_bgcolor: "rgba(0, 0, 0, 0)",
      font: { color: "#7FDBFF" },
      xaxis: {
         showgrid: false,
         position: 0,
         anchor: "free",
         mirror: "all",
         linecolor: "gray",
         title: "Date",
         showticklabels: true,
         ticks: "outside",
         rangeselector: buttonOptions,
      },
      yaxis: {
         showgrid: false,
         zeroline: false,
         linecolor: "gray",
         mirror: true,
         title: "Realized Equity $",
         ticks: "outside",
         minor: { nticks: 10, tickmode: "auto" },
      },
      yaxis2: {
         overlaying: "y",
         side: "right",
         showgrid: false,
         title: "% effective pnl",
         zeroline: false,
      },
      shapes: [
         // create horizontal line
         {
            type: "line",
            xref: "paper",
            x0: 0,
            y0: start_bal,
            x1: 1,
            y1: start_bal,
            line: {
               color: "#7FDBFF",
               width: 1,
               dash: "dash",
            },
         },
      ],
   };

   return <Plot data={[trace1, trace2]} layout={layout} config={config} />;
}

export default TotalPNL;
