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
  console.log(fetched_data);
}

dailypnl();
