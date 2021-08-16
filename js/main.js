// Root button
const btn = document.querySelector("#btn");
const overlay = document.querySelector("#overlay");
const close = document.querySelector("#close");
const popup = document.querySelector("#popup");

// Amount input
const rangeButtons = document.querySelectorAll("[data-range-action]");
const rangeValue = document.querySelector("#range__value");

const productName = document.querySelector("#product__name");
const productPrice = document.querySelector("#product__price");

// Size list
const sizeList = document.querySelector("#size__list");

// Variants
const variant = document.querySelector("#variant");

// Available
const availableIcon = document.querySelector("#available__icon");
const availableText = document.querySelector("#available__text");
const availableQuantity = document.querySelector("#available__quantity");
const deliveryBox = document.querySelector("#delivery__box");

// Cart
const addToCart = document.querySelector("#add__cart");

// Gallery
const galleryArrows = document.querySelectorAll(".gallery__arrow");
const gallerySlider = document.querySelector(".gallery__slider");
let currentImageIdx = 1;

// Handlers store
const popupHandlers = [];

// Config
const ICONS = {
  ok: "icons/ok.svg",
  error: "icons/red_close.svg",
};
const API_URL = "http://localhost:1234/posts";

// Cache
let cache = {};

// Store
let store = {
  name: "",
  product_id: 0,
  price: "",
  available: true,
  amount: 1,
  size: {
    name: "",
    price: 0,
    availAmount: 0,
    status: "",
  },
  variant: {
    id: 0,
    name: "",
    price_difference: 0,
    url: "",
    icons: [],
  },
};

// ---------- PRODUCT FUNCTIONS ----------
function initStore() {
  store.name = cache.product.name;

  const firstSize = getSizeByIndex(0);
  changeStoreSize(firstSize);

  const firstVariant = getVariantBy((vr) => vr.selected);
  const details = getVariantDetails(firstVariant);
  changeStoreVariant(details);
}

// Select size from cache by its ID (key name in object)
const getSizeByID = (key) => cache.sizes.items[key];

const getSizeByIndex = (index) => Object.values(cache.sizes.items)[index];

const getVariantBy = (cond) => {
  const variant = Object.values(cache.multiversions[0].items).filter(cond);

  return variant[0];
};

const getVariantValuesById = (variant, id) => {
  return Object.values(variant).filter((val) => val.id === id)[0];
};

const getVariantDetails = (variant) => {
  const id = parseInt(variant.values_id);
  const { name } = getVariantValuesById(variant.values, id);
  const { url, price_difference, product_id } = variant.products[0];
  const icons = variant.icons;

  return {
    id,
    name,
    url,
    icons,
    price_difference,
    product_id,
  };
};

const changeStoreSize = (details) => {
  store.size.name = details.name;
  store.size.availAmount = details.amount;
  store.size.status = details.status;
  store.size.price = details.price;
};

const changeStoreVariant = (variant) => {
  store.product_id = variant.product_id;
  store.variant.id = variant.id;
  store.variant.name = variant.name;
  store.variant.price_difference = variant.price_difference;
  store.variant.url = variant.url;
  store.variant.icons = variant.icons;
};

// ---------- RENDERERS ----------

/**
 * Change ok/error icon
 * @param {string} icon
 */
const setIcon = (icon) => {
  availableIcon.src = icon;
};

/**
 * Gray out add to cart button
 * @param {boolean} disabled
 */
const toggleAddToCart = (disabled) => {
  if (disabled) {
    addToCart.setAttribute("disabled", true);
  } else {
    addToCart.removeAttribute("disabled");
  }
};

/**
 * Show ok/error icon and toggle delivery box
 *
 * @param {boolean} [showDetails=true] If is available then we can
 * show information about delivery time
 */
const toggleStatus = (showDetails = true) => {
  if (showDetails) {
    setIcon(ICONS.ok);
    availableQuantity.classList.remove("display-none");
    deliveryBox.classList.remove("display-none");
  } else {
    setIcon(ICONS.error);
    availableQuantity.classList.add("display-none");
    deliveryBox.classList.add("display-none");
  }
};

/**
 * Show product name
 *
 */
const renderName = () => {
  productName.innerText = store.name;
};

/**
 * Show product price
 *
 */
const renderPrice = () => {
  const price =
    parseFloat(store.size.price) + parseFloat(store.variant.price_difference);

  store.price = price;
  productPrice.innerText = `${price} zł`;
};

/**
 * Show all available sizes
 */
const renderSizes = () => {
  Object.entries(cache.sizes.items).forEach(([key, details], idx) => {
    const { name, amount, status, price } = details;
    const id = key;

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "size";
    input.id = id;
    input.hidden = true;

    if (idx === 0) input.checked = true;

    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.classList.add("outline", "size__button", "info--detail");
    label.innerText = name;

    sizeList.appendChild(input);
    sizeList.appendChild(label);
  });
};

/**
 * Show appropriate images of selected variant
 */
const renderGalleryImage = () => {
  // Delete previous images
  while (gallerySlider.firstChild) {
    gallerySlider.removeChild(gallerySlider.lastChild);
  }

  // If one variant has 15 images and we change to one that has only 2
  // it will crash gallery, so the counter needs to be reset
  currentImageIdx = 1;

  const nodes = store.variant.icons.forEach((src, idx) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `${store.name} - ${store.variant.name}`;
    img.classList.add("gallery__image");

    if (idx === 0) img.classList.add("display-block");

    gallerySlider.appendChild(img);
  });
};

/**
 * Show list of available variants
 */
const renderVariants = () => {
  // ?????
  Object.values(cache.multiversions[0].items).forEach((details) => {
    const { enabled, selected } = details;
    if (enabled) {
      const data = getVariantDetails(details);

      const option = document.createElement("option");
      option.value = data.id;
      option.innerText = data.name;

      variant.appendChild(option);
    }
  });
};

/**
 * Show available quantity and status for the selected size
 */
const renderAvailability = () => {
  const { unit, unit_single, unit_plural, unit_fraction } = cache.sizes;
  const { availAmount: amount, status } = store.size;

  availableText.innerText = status;

  if (amount > 0) {
    let txt = "";
    if (amount === 1) {
      txt = `Dostępna ${amount} ${unit_fraction}`;
    } else {
      txt = `Dostępnych ${amount} ${unit}`;
    }

    store.available = true;
    availableQuantity.innerText = txt;

    toggleStatus(true);
    toggleAddToCart(false);
  } else {
    store.available = false;
    toggleStatus(false);
    toggleAddToCart(true);
  }
};

/**
 * When size is selected we must update few sections:
 * - update size in store
 * - rerender available section, icon and delivery information
 * - update price
 * @param {string} key
 */
const updateSizeDetails = (key) => {
  const size = getSizeByID(key);
  changeStoreSize(size);
  renderPrice();
  renderAvailability();
};

/**
 * Same as updateSize but:
 * - update variant in store
 * - show new images in gallery
 * @param {string} id
 */
const updateVariantDetails = (id) => {
  const variant = getVariantBy((vr) => vr.values_id === id);
  const details = getVariantDetails(variant);
  changeStoreVariant(details);
  renderAvailability();
  renderPrice();
  renderGalleryImage();
};

/**
 * Change image in gallery
 * @param {number} idx
 */
function showGalleryImage(idx) {
  const galleryImages = document.querySelectorAll(".gallery__image");
  const imagesLen = galleryImages.length;

  if (idx > imagesLen) {
    currentImageIdx = 1;
  } else if (idx < 1) {
    currentImageIdx = imagesLen;
  }

  galleryImages.forEach((image) => {
    image.classList.remove("display-block");
  });
  galleryImages[currentImageIdx - 1].classList.add("display-block");
}

// ---------- FUNCTIONS ----------

/**
 * Listen on element and return type, element, function
 *
 * @param {string} type Listened action
 * @param {HTMLElement} element
 * @param {() => void} fn Callback function
 * @return {*}
 */
function attachListener(type, element, fn) {
  const listener = element.addEventListener(type, fn);

  return {
    type,
    element,
    fn,
  };
}

// ---------- LISTENERS ----------

/**
 *  Enforce quantity when using keyboard instead of buttons
 *
 * @param {HTMLInputElement} elem
 * @return {*} Listener handler
 */
function enforceQuantity(elem) {
  return attachListener("keyup", elem, ({ target }) => {
    if (target.value != "") {
      if (parseInt(target.value) < parseInt(target.min)) {
        target.value = target.min;
      }
      if (parseInt(target.value) > parseInt(target.max)) {
        target.value = target.max;
      }
    }
  });
}

/**
 * Increment or decrement quantity
 *
 * @param {HTMLButtonElement} button
 * @param {HTMLInputElement} destValue
 */
function quantityRangeListener(button, destValue) {
  return attachListener("click", button, ({ target }) => {
    const action = target.dataset.rangeAction;
    if (action === "dec") {
      destValue.stepDown();
    } else if (action === "inc") {
      destValue.stepUp();
    }

    store.amount = parseInt(destValue.value);
  });
}

/**
 * Watch for changes in amount input
 *
 * @param {HTMLInputElement} elem
 * @return {*}
 */
function quantityistener(elem) {
  return attachListener("change", elem, ({ target }) => {
    const amount = parseInt(target.value);
    store.amount = amount;
  });
}

/**
 * Watch for changes when selecting size
 *
 * @return {*}
 */
function sizesListener() {
  const sizes = document.querySelectorAll("[name=size]");

  return [...sizes].map((el) =>
    attachListener("change", el, (event) => {
      if (event.currentTarget.checked) {
        const key = event.currentTarget.id;

        updateSizeDetails(key);
      }
    })
  );
}

/**
 * Watch for click action in size list
 *
 * @return {*}
 */
function variantsListener() {
  const variants = document.querySelector("#variant");

  return attachListener("change", variants, (event) => {
    const id = event.target.value;

    updateVariantDetails(id);
  });
}

/**
 * Send form after clicking addToCart button
 *
 * @param {HTMLButtonElement} elem
 * @return {*}
 */
function addToCartListener(elem) {
  return attachListener("click", elem, () => {
    if (store.available) {
      const data = {
        product_id: store.product_id,
        price: store.price,
        amount: store.amount,
      };

      // No need to await unless component is dynamically rendered
      sendForm({
        url: API_URL,
        data,
      });
    }
  });
}

/**
 * Hide/show overlay, popup and detach events
 *
 * @param {HTMLButtonElement} elem
 * @param {() => void} cb Callback function
 * @return {*}
 */
function togglePopupListener(elem, cb) {
  return attachListener("click", elem, () => {
    cb();

    overlay.classList.toggle("visible");
    popup.classList.toggle("visible");
  });
}

function galleryArrowListener(elem) {
  return attachListener("click", elem, ({ target }) => {
    const direction = target.dataset.galleryDirection;

    const idx = parseInt(direction);
    // HMR kills state and removes idx
    currentImageIdx += isNaN(idx) ? currentImageIdx : idx;
    showGalleryImage(currentImageIdx);
  });
}

// ---------- FORM ----------

async function sendForm({ url, data, options }) {
  const formData = new FormData();

  for (const field in data) {
    formData.append(field, data[field]);
  }

  await fetch(url, {
    body: formData,
    method: "POST",
    mode: "no-cors", // For local json server purposes
  });
}

// ---------- MAIN ----------
togglePopupListener(btn, async () => {
  const data = await fetch("./xbox.json");
  const json = await data.json();

  cache = json;

  initStore();
  renderName();
  renderPrice();
  renderSizes();
  renderVariants();
  renderAvailability();
  renderGalleryImage();

  showGalleryImage(currentImageIdx);

  /**
   * After clicking button:
   * - add listener to quantity input
   * - listener for increment and decrement buttons
   *
   * store handlers in root array
   * maybe move elements to arguments rather than hard coding in function body?
   */
  const enforceQuantityHandler = enforceQuantity(rangeValue);
  const rangeButtonDec = quantityRangeListener(rangeButtons[0], rangeValue);
  const rangeButtonInc = quantityRangeListener(rangeButtons[1], rangeValue);
  const arrowPrev = galleryArrowListener(galleryArrows[0]);
  const arrowNext = galleryArrowListener(galleryArrows[1]);
  const sizes = sizesListener();
  const variants = variantsListener();
  const cart = addToCartListener(addToCart);
  const amount = quantityistener(rangeValue);

  sizes.forEach((lst) => popupHandlers.push(lst));
  popupHandlers.push(variants);
  popupHandlers.push(enforceQuantityHandler);
  popupHandlers.push(rangeButtonDec);
  popupHandlers.push(rangeButtonInc);
  popupHandlers.push(arrowPrev);
  popupHandlers.push(arrowNext);
  popupHandlers.push(amount);
  popupHandlers.push(cart);

  const hidePopupCallback = () => {
    popupHandlers.forEach(({ type, element, fn }, idx) => {
      element.removeEventListener(type, fn);
    });
  };

  /**
   * After clicking overlay background or X button:
   * - remove all event listeners from popup
   * - hide popup
   */
  togglePopupListener(overlay, hidePopupCallback);
  togglePopupListener(close, hidePopupCallback);
});
