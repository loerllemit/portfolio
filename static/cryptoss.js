// window.addEventListener("load", (event) => {
//   // let socket = createws(asset, activeInterval);
// });

var asset = document.querySelector('input[name="options"]:checked').value;
// var activeInterval = "1m";
var intervals_list = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"];
var TFswitcher = document.getElementById("timeframe");
var activeInterval = intervals_list[0];

let coins = document.querySelectorAll('input[name="options"]');

const min_tick = {
  BTCUSDT: 0.01,
  ETHUSDT: 0.01,
  SOLUSDT: 0.01,
  BNBUSDT: 0.01,
  DOTUSDT: 0.01,
  MATICUSDT: 0.0001,
  ADAUSDT: 0.0001,
  XRPUSDT: 0.0001,
  DOGEUSDT: 0.00001,
  SHIBUSDT: 0.00000001,
};

const domElement = document.getElementById("tvchart");

function initchart(asset) {
  let chart = LightweightCharts.createChart(domElement, {
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
      text: asset.toUpperCase(),
      fontFamily: "Roboto",
      fontStyle: "bold",
    },
  });

  let candleSeries = chart.addCandlestickSeries({
    upColor: "#00bdfc",
    downColor: "#fc2200",
    priceFormat: {
      minMove: min_tick[asset.toUpperCase()],
    },
  });

  let volumeSeries = chart.addHistogramSeries({
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
  var socket = new WebSocket(
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
console.log(asset);
let [chart, candleSeries, volumeSeries] = initchart(asset);
let socket = fetchws(asset, activeInterval);

for (let i = 0; i < coins.length; i++) {
  coins[i].addEventListener("change", function () {
    asset = this.value; // this == the clicked radio,
    //   chart.removeSeries(candleSeries);
    chart.remove();
    socket.close();

    [chart, candleSeries, volumeSeries] = initchart(asset);
    socket = fetchws(asset, activeInterval);

    console.log(asset);
  });
}

var intervalElements = intervals_list.map(function (item) {
  var itemEl = document.createElement("button");
  itemEl.innerText = item;
  itemEl.classList.add("switcher-item");
  itemEl.classList.toggle("switcher-active-item", item === activeInterval);
  itemEl.setAttribute("name", "timeframe");
  TFswitcher.appendChild(itemEl);
  return itemEl;
});

// var intervalElements = document.querySelectorAll('button[name="timeframe"]');

for (let i = 0; i < intervalElements.length; i++) {
  intervalElements[i].addEventListener("click", function () {
    activeInterval = this.innerText; // this == the current selection in the loop,
    intervalElements.forEach(function (element, index) {
      element.classList.toggle(
        "switcher-active-item",
        intervals_list[index] === activeInterval
      );
    });

    chart.remove();
    socket.close();

    [chart, candleSeries, volumeSeries] = initchart(asset);
    socket = fetchws(asset, activeInterval);
    console.log(activeInterval);
  });
}
