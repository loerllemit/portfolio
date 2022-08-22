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
