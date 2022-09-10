// window.addEventListener("load", (event) => {
//   // let socket = createws(asset, activeInterval);
// });

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

var coins_list = Object.keys(min_tick);
let coins = document.querySelectorAll('input[name="options"]');

var asset = document.querySelector('input[name="options"]:checked').value;
var intervals_list = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"];
var TFswitcher = document.getElementById("timeframe");
var activeInterval = intervals_list[0];
var activeCoin = coins_list[0];

const domElement = document.getElementById("tvchart");

function updatepnl(curr_price) {
  let ordertype = document.getElementById("ordertype");
  let units = document.getElementById("units");
  let execprice = document.getElementById("execprice");
  let currentprice = document.getElementById("currentprice");
  let pnl = document.getElementById("pnl");
  let pnl_pcnt = document.getElementById("pnl_pcnt");

  currentprice.innerHTML = curr_price;

  if (ordertype.value == "LONG") {
    pnl.innerHTML = (
      parseFloat(units.value) *
      (parseFloat(currentprice.innerHTML) - parseFloat(execprice.value))
    ).toFixed(3);
    pnl_pcnt.innerHTML = (
      ((parseFloat(currentprice.innerHTML) - parseFloat(execprice.value)) *
        100) /
      parseFloat(execprice.value)
    ).toFixed(3);
  } else {
    pnl.innerHTML = -(
      parseFloat(units.value) *
      (parseFloat(currentprice.innerHTML) - parseFloat(execprice.value))
    ).toFixed(3);
    pnl_pcnt.innerHTML = -(
      ((parseFloat(currentprice.innerHTML) - parseFloat(execprice.value)) *
        100) /
      parseFloat(execprice.value)
    ).toFixed(3);
  }

  if (parseFloat(pnl_pcnt.innerHTML) < 0) {
    pnl.style.color = "#ff3333";
    pnl_pcnt.style.color = "#ff3333";
  } else {
    pnl.style.color = "#66ff99";
    pnl_pcnt.style.color = "#66ff99";
  }
}

function initchart(asset) {
  let chart = LightweightCharts.createChart(domElement, {
    // width: 800,
    height: 550,
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

    updatepnl(cdata_upd["close"]);
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
    chart.remove();
    socket.close();

    [chart, candleSeries, volumeSeries] = initchart(asset);
    socket = fetchws(asset, activeInterval);

    console.log(asset);
  });
}

var tests = document.getElementById("test");

// var coinElements = coins_list.map(function (item) {
//   var itemEl = document.createElement("label");
//   itemEl.setAttribute("class", "btn btn-secondary");
//   itemEl.setAttribute("for", item);

//   itemInput = document.createElement("input");
//   itemInput.type = "radio";
//   itemInput.value = item;
//   itemInput.autocomplete = "off";
//   itemInput.id = item;

//   // itemEl.innerText = item;
//   itemEl.textContent = item;
//   itemEl.appendChild(itemInput);

//   itemEl.classList.add("active");
//   itemEl.classList.toggle("active", item === activeCoin);
//   tests.appendChild(itemEl);

//   return itemEl;
// });

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

// create real time button
var chartWidth = domElement.getBoundingClientRect().width;
var chartHeight = domElement.getBoundingClientRect().height;
chart.timeScale().scrollToPosition(5, true);

var width = 27;
var height = 100;

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
