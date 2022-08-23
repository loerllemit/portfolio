// window.addEventListener("load", (event) => {
//   // let socket = createws(asset, interval);
// });

var asset = document.querySelector('input[name="options"]:checked').value;
var interval = "1m";
let coins = document.querySelectorAll('input[name="options"]');

const domElement = document.getElementById("tvchart");

function initchart() {
  var chart = LightweightCharts.createChart(domElement, {
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

  var candleSeries = chart.addCandlestickSeries({
    upColor: "#00bdfc",
    downColor: "#fc2200",
  });

  var volumeSeries = chart.addHistogramSeries({
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
  return [chart, candleSeries, volumeSeries];
}

function fetchws(asset, interval) {
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
    .catch((err) => console.log(err));

  // stream from websocket
  socket = new WebSocket(
    `wss://stream.binance.com:9443/ws/${asset.toLowerCase()}@kline_${interval}`
  );

  socket.onmessage = function (event) {
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
    console.log(cdata_upd);
  };
  return socket;
}

// initialize the chart, fetch and websocket
chart = initchart()[0];
candleSeries = initchart()[1];
volumeSeries = initchart()[2];
socket = fetchws(asset, interval);

for (let i = 0; i < coins.length; i++) {
  coins[i].addEventListener("change", function () {
    let asset = this.value; // this == the clicked radio,
    chart.removeSeries(candleSeries);
    chart.removeSeries(volumeSeries);
    socket.close();

    chart = initchart()[0];
    candleSeries = initchart()[1];
    volumeSeries = initchart()[2];
    socket = fetchws(asset, interval);
    // socket = createws(asset, interval);

    console.log(asset);
  });
}
