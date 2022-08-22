export default function createSimpleSwitcher(
  items,
  activeItem,
  activeItemChangedCallback
) {
  var switcherElement = document.getElementById("switcher");

  var intervalElements = items.map(function (item) {
    var itemEl = document.createElement("button");
    itemEl.innerText = item;
    itemEl.classList.add("switcher-item");
    itemEl.classList.toggle("switcher-active-item", item === activeItem);
    itemEl.addEventListener("click", function () {
      onItemClicked(item);
    });
    switcherElement.appendChild(itemEl);
    return itemEl;
  });

  function onItemClicked(item) {
    if (item === activeItem) {
      return;
    }

    intervalElements.forEach(function (element, index) {
      element.classList.toggle("switcher-active-item", items[index] === item);
    });

    activeItem = item;

    activeItemChangedCallback(item);
  }

  return switcherElement;
}
