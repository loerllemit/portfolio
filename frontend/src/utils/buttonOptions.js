let buttonOptions = {
   activecolor: "rgb(47,79,79)",
   bgcolor: "#708090",
   buttons: [
      {
         step: "month",
         stepmode: "backward",
         count: 1,
         label: "1m",
      },
      {
         step: "month",
         stepmode: "backward",
         count: 3,
         label: "3m",
      },
      {
         step: "month",
         stepmode: "backward",
         count: 6,
         label: "6m",
      },
      {
         step: "month",
         stepmode: "backward",
         count: 9,
         label: "9m",
      },
      {
         step: "year",
         stepmode: "todate",
         count: 1,
         label: "YTD",
      },
      {
         step: "year",
         stepmode: "backward",
         count: 1,
         label: "1y",
      },
      {
         step: "all",
      },
   ],
};

export default buttonOptions;
