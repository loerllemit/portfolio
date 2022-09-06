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

async function dailypnl() {
  const fetched_data = await makeRequest("/api", "get");
  console.log(fetched_data);

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
    marker: { color: "red" },
    hovertemplate: "date: %{x} <br>pnl: %{y:$.2f} <extra></extra>",
  };

  var data = [trace1, trace2];
  var layout = {
    title: "Daily Realized PNL",
    showlegend: false,
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
  var config = {
    scrollZoom: true,
    displayModeBar: true,
    toImageButtonOptions: {
      format: "svg", // one of png, svg, jpeg, webp
      filename: "custom_image",
      height: 300,
      width: 1200,
      scale: 1, // Multiply title/legend/axis/canvas sizes by this factor
    },
  };

  Plotly.newPlot("dailypnl", data, layout, config);
}

dailypnl();
