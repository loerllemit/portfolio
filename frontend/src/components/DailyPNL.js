import React from "react";
import Plot from "react-plotly.js";
import buttonOptions from "../utils/buttonOptions";
import config from "../utils/Config";

function DailyPNL({ data, width, height }) {
   let date_pos = data["daily_pnl_pos"]["date"];
   let date_neg = data["daily_pnl_neg"]["date"];
   let pnl_pos = data["daily_pnl_pos"]["rec"];
   let pnl_neg = data["daily_pnl_neg"]["rec"];

   let trace1 = {
      x: date_pos,
      y: pnl_pos,
      type: "bar",
      marker: { color: "deepskyblue" },
      hovertemplate: "date: %{x} <br>pnl: %{y:$.2f} <extra></extra>",
   };
   let trace2 = {
      x: date_neg,
      y: pnl_neg,
      type: "bar",
      marker: { color: "crimson" },
      hovertemplate: "date: %{x} <br>pnl: %{y:$.2f} <extra></extra>",
   };
   let layout = {
      title: "Daily Realized PNL",
      showlegend: false,
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
         title: "Profit $",
         ticks: "outside",
         minor: { nticks: 10, tickmode: "auto" },
      },
   };
   return <Plot data={[trace1, trace2]} layout={layout} config={config} />;
}

export default DailyPNL;
