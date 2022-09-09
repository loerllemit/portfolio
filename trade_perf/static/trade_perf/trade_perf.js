async function makeRequest(url, method, body) {
  let headers = {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json",
  };

  if (method == "post") {
    const csrf = document.querySelector("[name=csrfmiddlewaretoken]").value;
    headers["X-CSRFToken"] = csrf;
  }
  let response = await fetch(url, {
    method: method,
    headers: headers,
    body: body,
  });

  return await response.json();
}

var config = {
  scrollZoom: true,
  displayModeBar: true,
  toImageButtonOptions: {
    format: "png", // one of png, svg, jpeg, webp
    filename: "custom_image",
    height: 300,
    width: 1200,
    scale: 1, // Multiply title/legend/axis/canvas sizes by this factor
  },
};

var buttonOptions = {
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

function dailypnl(fetched_data) {
  let date_pos = fetched_data["daily_pnl_pos"]["date"];
  let date_neg = fetched_data["daily_pnl_neg"]["date"];
  let pnl_pos = fetched_data["daily_pnl_pos"]["rec"];
  let pnl_neg = fetched_data["daily_pnl_neg"]["rec"];

  var trace1 = {
    x: date_pos,
    y: pnl_pos,
    type: "bar",
    marker: { color: "deepskyblue" },
    hovertemplate: "date: %{x} <br>pnl: %{y:$.2f} <extra></extra>",
  };
  var trace2 = {
    x: date_neg,
    y: pnl_neg,
    type: "bar",
    marker: { color: "crimson" },
    hovertemplate: "date: %{x} <br>pnl: %{y:$.2f} <extra></extra>",
  };

  var data = [trace1, trace2];
  var layout = {
    title: "Daily Realized PNL",
    showlegend: false,
    height: 550,
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

  Plotly.newPlot("dailypnl", data, layout, config);
}

function tpnl(fetched_data) {
  let start_bal = fetched_data["start_bal"];
  let date = fetched_data["daily_pnl"]["date"];
  let pnl = fetched_data["daily_pnl"]["capital"];
  let pct_pnl = fetched_data["daily_pnl"]["pct_pnl"];

  var trace1 = {
    x: date,
    y: pnl,
    modes: "lines",
    name: "nominal",
    hovertemplate: "date: %{x} <br>equity: %{y:$.2f} <extra></extra>",
  };
  var trace2 = {
    x: date,
    y: pct_pnl,
    modes: "lines",
    name: "percent",
    yaxis: "y2",
    hovertemplate: "date: %{x} <br>% pnl: %{y:.2f} <extra></extra>",
  };
  var data = [trace1, trace2];
  var layout = {
    title: "Total Realized Equity",
    showlegend: true,
    height: 550,
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
  Plotly.newPlot("total_pnl", data, layout, config);
}

function cal_pnl(fetched_data) {
  google.charts.load("current", { packages: ["calendar"] });
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    let date = fetched_data["daily_pnl"]["date"];
    date = date.map((e) => new Date(e));
    let pnl = fetched_data["daily_pnl"]["rec"];
    var combined = date.map((e, i) => [e, pnl[i]]);

    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: "date", id: "Date" });
    dataTable.addColumn({ type: "number", id: "PNL" });

    dataTable.addRows(combined);

    var chart = new google.visualization.Calendar(
      document.getElementById("cal_pnl")
    );
    var options = {
      title: "Daily Profit and Loss",
      height: 550,
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

    chart.draw(dataTable, options);
  }
}

function top_win(fetched_data) {
  let assets = fetched_data["top_gain"]["details"].slice(-25);
  let rec = fetched_data["top_gain"]["realized_equity_change"].slice(-25);
  var data = [
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
  var layout = {
    title: "Top Gainers",
    showlegend: false,
    height: 550,
    paper_bgcolor: "rgba(0, 0, 0, 0)",
    plot_bgcolor: "rgba(0, 0, 0, 0)",
    font: { color: "#7FDBFF" },
    coloraxis: { showscale: false },
    margin: { t: 40, b: 60, l: 10, r: 10 },
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
  Plotly.newPlot("top_win", data, layout);
}

function top_loss(fetched_data) {
  let assets = fetched_data["top_loss"]["details"].slice(-25);
  let rec = fetched_data["top_loss"]["realized_equity_change"].slice(-25);
  var data = [
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
    height: 550,
    paper_bgcolor: "rgba(0, 0, 0, 0)",
    plot_bgcolor: "rgba(0, 0, 0, 0)",
    font: { color: "#7FDBFF" },
    coloraxis: { showscale: false },
    margin: { t: 40, b: 60, l: 10, r: 10 },
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
  Plotly.newPlot("top_loss", data, layout);
}

function most_traded(fetched_data) {
  let assets = fetched_data["most_traded"]["details"];
  let counts = fetched_data["most_traded"]["counts"];

  var data = [
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
  var layout = {
    title: "Most Traded Asset",
    paper_bgcolor: "rgba(0, 0, 0, 0)",
    plot_bgcolor: "rgba(0, 0, 0, 0)",
    font: { color: "#7FDBFF" },
    margin: { t: 60, b: 0, l: 0, r: 0 },
  };
  Plotly.newPlot("most_traded", data, layout);
}

function stats(fetched_data) {
  let name_list = fetched_data["name_list"];
  let val_list = fetched_data["val_list"];

  var headerColor = "grey";
  var rowEvenColor = "lightgrey";
  var rowOddColor = "white";
  var data = [
    {
      type: "table",
      header: {
        values: [["<b>Parameters</b>"], ["<b>Values</b>"]],
        align: "center",
        line: { width: 1, color: "black" },
        fill: { color: headerColor },
        font: { family: "Arial", size: 12, color: "white" },
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
        font: { family: "Arial", size: 12, color: ["darkslategray"] },
      },
    },
  ];
  var layout = {
    title: "Statistics",
    paper_bgcolor: "rgba(0, 0, 0, 0)",
    plot_bgcolor: "rgba(0, 0, 0, 0)",
    font: { color: "#7FDBFF" },
    // height: 600,

    // margin: { t: 60, b: 0, l: 0, r: 0 },
  };

  Plotly.newPlot("tab_stats", data, layout);
}

async function drawcharts() {
  const fetched_data = await makeRequest("/api", "get");
  console.log(fetched_data);
  dailypnl(fetched_data);
  tpnl(fetched_data);
  cal_pnl(fetched_data);
  top_win(fetched_data);
  top_loss(fetched_data);
  most_traded(fetched_data);
  stats(fetched_data);
}

drawcharts();
