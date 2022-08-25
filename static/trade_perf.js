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
  const fetched_data = await makeRequest("/trade", "get");
  let test = document.getElementById("test");
  console.log(fetched_data["date"]);

  var chartColors = {
    red: "rgba(255, 99, 132,0.7)",
    blue: "rgba(54, 162, 235,0.7)",
  };

  const labels = fetched_data["date"].slice(-50);
  console.log(labels.length);
  const data = {
    labels: labels,
    datasets: [
      {
        backgroundColor: Array(labels.length).fill(chartColors.blue),
        // borderColor: "rgb(255, 99, 132)",
        borderWidth: 1,
        data: fetched_data["daily_pnl"].slice(-50),
      },
    ],
  };

  const plugin = {
    id: "custom_canvas_background_color",
    beforeDraw: (chart) => {
      const { ctx } = chart;
      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    },
  };

  const config = {
    type: "bar",
    data: data,
    plugins: [plugin],
    options: {
      responsive: true,
      animation: {
        onComplete: () => {
          delayed = true;
        },
        delay: (context) => {
          let delay = 0;
          if (
            context.type === "data" &&
            context.mode === "default" &&
            !delayed
          ) {
            delay = context.dataIndex * 300 + context.datasetIndex * 100;
          }
          return delay;
        },
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Daily Realized PNL",
        },
      },

      scales: {
        x: {
          grid: {
            display: false,
          },
          title: { display: true, text: "Date" },
        },
        y: {
          grid: {
            display: false,
          },
          title: { display: true, text: "Profit $" },
        },
      },
    },
  };
  var myChart = new Chart(document.getElementById("myChart"), config);

  var colorChangeValue = 0; //set this to whatever is the deciding color change value
  var dataset = myChart.data.datasets[0];

  for (var i = 0; i < dataset.data.length; i++) {
    if (dataset.data[i] < colorChangeValue) {
      dataset.backgroundColor[i] = chartColors.red;
    }
  }

  myChart.update();
}

dailypnl();
