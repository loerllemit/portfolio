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

async function dailypnl() {
  const fetched_data = await makeRequest("/api", "get");
  let date = fetched_data[1]["date"];
  let pnl = fetched_data[1]["rec"];
  console.log(date);

  var data = [
    {
      x: date,
      y: pnl,
      type: "bar",
      marker: { color: "deepskyblue" },
    },
  ];
  var layout = {
    title: "Daily Realized PNL",
    showlegend: false,
    paper_bgcolor: "rgba(0, 0, 0, 0)",
    plot_bgcolor: "rgba(0, 0, 0, 0)",
  };
  Plotly.newPlot("dailypnl", data, layout);
}

dailypnl();
