import React from "react";
import { Chart } from "react-google-charts";

function CalendarPNL({ data, width, height }) {
   let date = data["daily_pnl"]["date"];
   let pnl = data["daily_pnl"]["rec"];
   let combined = date.map((e, i) => [new Date(e), pnl[i]]);

   const caldata = [
      [
         {
            type: "date",
            id: "Date",
         },
         {
            type: "number",
            id: "PNL",
         },
      ],
      ...combined,
   ];
   const options = {
      title: "Daily Profit and Loss",
      height: 0.8 * height,
      width: 0.8 * width,
      tooltip: { isHtml: true },
      calendar: {
         cellSize: 18,
         cellColor: {
            stroke: "#7676a2",
            strokeOpacity: 0.5,
            strokeWidth: 1,
         },
         dayOfWeekLabel: {
            fontName: "Times-Roman",
            fontSize: 12,
            color: "#ff1ac6",
            bold: true,
            italic: true,
         },
         monthLabel: {
            fontName: "Times-Roman",
            fontSize: 14,
            color: "#ff1ac6",
            bold: true,
            italic: true,
         },
      },
   };
   return (
      <div className="flex flex-row mx-auto content-center justify-center ">
         <Chart chartType="Calendar" data={caldata} options={options} />
      </div>
   );
}

export default CalendarPNL;
