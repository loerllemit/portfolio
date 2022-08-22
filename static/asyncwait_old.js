window.addEventListener("load", (event) => {
  let socket = createws(asset, interval);
});

var asset = document.querySelector('input[name="options"]:checked').value;
var interval = "1m";
let elements = document.querySelectorAll('input[name="options"]');

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
  //   console.log(data);
}

async function getNumber() {
  const data = await makeRequest("/asyncwait", "get");
  let ul_left = document.getElementById("left");
  let li = document.createElement("li");
  li.addEventListener("click", getFloatNumber);
  li.innerHTML = await data["number"];
  ul_left.appendChild(li);
}

async function getFloatNumber(e) {
  let number = e.target.innerText;
  let data = await makeRequest(
    "/asyncwait",
    "post",
    JSON.stringify({ number: number })
  );
  console.log(data.response);
  let ul_right = document.getElementById("right");
  let li = document.createElement("li");
  li.innerText = data["float"];
  ul_right.appendChild(li);
}

function createws(asset, interval) {
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
    console.log(cdata_upd);
  };
  return socket;
}

for (let i = 0; i < elements.length; i++) {
  elements[i].addEventListener("change", function () {
    let val = this.value; // this == the clicked radio,
    socket.close();
    socket = createws(val, interval);

    console.log(val);
  });
}
