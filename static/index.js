import createSimpleSwitcher from "./time_switch.mjs";
document.body.style.position = "relative";
const log = console.log;

var asset = "btcusdt";
// var interval = "1m";
var intervals = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"];

var switcherElement = createSimpleSwitcher(
  intervals,
  intervals[0],
  syncToInterval
);

const domElement = document.getElementById("tvchart");
// document.body.appendChild(switcherElement);

const chart = LightweightCharts.createChart(domElement, {
  // width: 800,
  height: 600,
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
  },
  layout: {
    background: { type: "Solid", color: "rgba(43, 43, 67, 0.1)" },
    textColor: "white",
  },
  grid: {
    vertLines: { visible: false },
    horzLines: { visible: false },
  },
  watermark: {
    visible: true,
    fontSize: 150,
    horzAlign: "center",
    vertAlign: "center",
    color: "rgba(222, 20, 218, 0.45)",
    text: `${asset.toUpperCase()}`,
    fontFamily: "Roboto",
    fontStyle: "bold",
  },
});

var candleSeries = null;
var volumeSeries = null;
var socket = null;

function syncToInterval(interval) {
  if (candleSeries && volumeSeries) {
    chart.removeSeries(candleSeries);
    chart.removeSeries(volumeSeries);

    candleSeries = null;
    volumeSeries = null;
    socket.close();
  }

  candleSeries = chart.addCandlestickSeries({
    upColor: "#00bdfc",
    downColor: "#fc2200",
  });
  volumeSeries = chart.addHistogramSeries({
    color: "yellow",
    priceFormat: {
      type: "volume",
    },
    priceScaleId: "",
    scaleMargins: {
      top: 0.8,
      bottom: 0,
    },
  });

  // get historical data from REST API
  fetch(
    `https://api.binance.com/api/v3/klines?symbol=${asset.toUpperCase()}&interval=${interval}&limit=1000`
  )
    .then((res) => res.json())
    .then((data) => {
      const cdata = data.map((d) => {
        return {
          time: d[0] / 1000 + 8 * 60 * 60, //offset timezone for Asia/Manila
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        };
      });
      const cvol = data.map((d) => {
        return {
          time: d[0] / 1000 + 8 * 60 * 60, //offset timezone for Asia/Manila
          value: parseFloat(d[5]),
        };
      });
      candleSeries.setData(cdata);
      volumeSeries.setData(cvol);
    })
    .catch((err) => log(err));
  // stream from websocket
  socket = new WebSocket(
    `wss://stream.binance.com:9443/ws/${asset.toLowerCase()}@kline_${interval}`
  );
  socket.onmessage = function (event) {
    // log(event);
    let data = JSON.parse(event.data);
    let cdata_upd = {
      time: data.k.t / 1000 + 8 * 60 * 60, //offset timezone for Asia/Manila
      open: parseFloat(data.k.o),
      close: parseFloat(data.k.c),
      high: parseFloat(data.k.h),
      low: parseFloat(data.k.l),
    };
    let cvol_upd = {
      time: data.k.t / 1000 + 8 * 60 * 60, //offset timezone for Asia/Manila
      value: parseFloat(data.k.v),
    };
    candleSeries.update(cdata_upd);
    volumeSeries.update(cvol_upd);

    log(cdata_upd);
  };
}

syncToInterval(intervals[0]);
// const candleSeries = chart.addCandlestickSeries();
// const volumeSeries = chart.addHistogramSeries({
//   color: "#bf15b4",
//   priceFormat: {
//     type: "volume",
//   },
//   priceScaleId: "",
//   scaleMargins: {
//     top: 0.8,
//     bottom: 0,
//   },
// });

// create real time button
var chartWidth = domElement.getBoundingClientRect().width;
var chartHeight = domElement.getBoundingClientRect().height;
chart.timeScale().scrollToPosition(5, true);

var width = 27;
var height = 27;

var button = document.createElement("div");
button.className = "go-to-realtime-button";
button.style.left = chartWidth - width - 75 + "px";
button.style.top = chartHeight - height - 25 + "px";
button.style.color = "#4c525e";
button.innerHTML =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" width="14" height="14"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6.5 1.5l5 5.5-5 5.5M3 4l2.5 3L3 10"></path></svg>';
document.body.appendChild(button);

var timeScale = chart.timeScale();
timeScale.subscribeVisibleTimeRangeChange(function () {
  var buttonVisible = timeScale.scrollPosition() < 0;
  button.style.display = buttonVisible ? "block" : "none";
});

button.addEventListener("click", function () {
  // timeScale.scrollToRealTime();
  timeScale.scrollToPosition(5, true);
});

button.addEventListener("mouseover", function () {
  button.style.background = "rgba(250, 250, 250, 1)";
  button.style.color = "#000";
});

button.addEventListener("mouseout", function () {
  button.style.background = "rgba(250, 250, 250, 0.6)";
  button.style.color = "#4c525e";
});
