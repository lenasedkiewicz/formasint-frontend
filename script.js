const BASE_URL = "https://brandstestowy.smallhost.pl/api";
const SLIDER_ITEMS = 10;

const menu = document.getElementById("menu");
const arrow = document.getElementById("swiper-button-next");
const productGrid = document.getElementById("productGrid");

let sliderSwipe = 0;
let currentPage = 1;
let pageSize = 14;
let currentlyRequestedItems = 14;
let isLoading = false;
let allProductsLoaded = false;
let allLoadedProducts = [];

menu.querySelectorAll('ul li a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const id = link.getAttribute("href").substring(1);
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  });
});

function createProductCards(products) {
  const wrapper = document.getElementById("product-wrapper");
  wrapper.innerHTML = "";

  products.forEach((product) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    let badgeClass = "";
    if (product.badge === "BESTSELLER") {
      badgeClass = "bestseller";
    } else if (product.badge === "LIMITED EDITION") {
      badgeClass = "limited";
    }

    slide.innerHTML = `
      <div class="product-card animation">
        <div class="product-image">
          <img src="${product.image}" alt="${product.text}">
          ${
            product.id === 1 || product.id === 4
              ? `<div class="badge bestseller">BESTSELLER</div>`
              : ""
          }
          ${
            product.id === 2
              ? `<div class="badge limited">LIMITED EDITION</div>`
              : ""
          }
          <img class="favorite-empty" src="./images/icons/icon_favorite.png" />
          <img class="favorite-fill" src="./images/icons/icon_favorite_fill.png" />
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.text}</h3>
        <div class="product-price">€${product.price || ""} EUR</div>
      </div>
    `;

    wrapper.appendChild(slide);
  });
}

async function fetchProducts(pageNumber, pageSize) {
  try {
    const response = await fetch(
      `${BASE_URL}/random?pagenumber=${pageNumber}&pageSize=${pageSize}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    if (data && data.data && Array.isArray(data.data)) {
      createProductCards(data.data);

      if (window.productSwiper) {
        window.productSwiper.update();
      }
    } else {
      console.error("Unexpected data structure:", data);
    }

    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    document.getElementById("product-wrapper").innerHTML = `
      <div class="error-message">
        Unable to load products. Please try again later.
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  window.productSwiper = new Swiper(".product-swiper", {
    slidesPerView: 1,
    spaceBetween: 10,
    loop: true,
    loopAdditionalSlides: 10,
    navigation: {
      nextEl: ".swiper-button-next",
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      992: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
      1200: {
        slidesPerView: 4,
        spaceBetween: 20,
      },
    },
    on: {
      init: function () {
        updateProgressBar(this);
      },
      slideChange: function () {
        updateProgressBar(this);
      },
    },
    transitionEnd: function () {
      updateProgressBar(this);
    },
  });

  fetchProducts(1, SLIDER_ITEMS);
});

arrow.addEventListener("click", () => {
  if (sliderSwipe === SLIDER_ITEMS - 1) {
    sliderSwipe = 0;
  } else {
    sliderSwipe++;
  }
});

function updateProgressBar(swiper) {
  const progressBar = document.getElementById("swiper-progress-bar");
  const sliderLength = document.getElementsByClassName("animation").length - 3;

  let progress;
  if (sliderSwipe < 6) {
    progress = 25 + (sliderSwipe / sliderLength) * 100;
  } else if (sliderSwipe >= 6) {
    progress = 100;
  } else {
    progress = 25;
  }

  if (progress < 25) progress = 25;
  if (progress > 100) progress = 100;

  if (sliderSwipe === 0) {
    progress = 25;
  }

  progressBar.style.width = progress + "%";
}

function renderProductGrid(products) {
  productGrid.innerHTML = "";

  if (products.length === 0) {
    productGrid.innerHTML = "<p>No products found.</p>";
    return;
  }

  products.forEach((product, index) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card animation";
    productCard.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.text}">
        <div class="badge id">${product.id}</div>
      </div>
    `;

    if (index % pageSize === 5 && index !== 0) {
      const promoCell = document.createElement("div");
      promoCell.className = "promo-cell";
      promoCell.innerHTML = `
        <div class="promo-title">You'll look and feel like the champion.</div>
        <button class="promo-button">Check it out</button>
      `;
      productGrid.appendChild(promoCell);
    }

    productGrid.appendChild(productCard);
  });
}

function loadInitialProducts() {
  currentlyRequestedItems = pageSize;
  allProductsLoaded = false;

  fetchProducts(1, pageSize)
    .then((response) => {
      allLoadedProducts = [...response.data];
      renderProductGrid(allLoadedProducts);

      if (response.data.length < pageSize) {
        allProductsLoaded = true;
      }
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
      productGrid.innerHTML =
        "<p>Failed to load products. Please try again later.</p>";
    });
}

function loadMoreProducts() {
  if (isLoading || allProductsLoaded) return;

  isLoading = true;

  currentlyRequestedItems += pageSize;

  const loadingIndicator = document.createElement("div");
  loadingIndicator.id = "loadingIndicator";
  loadingIndicator.className = "loading-indicator";
  loadingIndicator.textContent = "Loading more products...";
  productGrid.appendChild(loadingIndicator);

  fetchProducts(1, currentlyRequestedItems)
    .then((response) => {
      const indicator = document.getElementById("loadingIndicator");
      if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }

      if (response.data && response.data.length > 0) {
        allLoadedProducts = [...response.data];

        renderProductGrid(allLoadedProducts);

        if (response.data.length < currentlyRequestedItems) {
          allProductsLoaded = true;
        }
      } else {
        allProductsLoaded = true;
      }

      isLoading = false;
    })
    .catch((error) => {
      const indicator = document.getElementById("loadingIndicator");
      if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }

      console.error("Error fetching more products:", error);
      const errorMessage = document.createElement("div");
      errorMessage.className = "error-message";
      errorMessage.textContent =
        "Failed to load more products. Please try again later.";
      productGrid.appendChild(errorMessage);

      isLoading = false;
    });
}

function handlePageSizeChange(newPageSize) {
  const oldPageSize = pageSize;
  pageSize = newPageSize;

  currentlyRequestedItems = newPageSize;
  allProductsLoaded = false;

  fetchProducts(1, currentlyRequestedItems)
    .then((response) => {
      allLoadedProducts = [...response.data];
      renderProductGrid(allLoadedProducts);

      if (response.data.length < currentlyRequestedItems) {
        allProductsLoaded = true;
      }
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
      productGrid.innerHTML =
        "<p>Failed to load products. Please try again later.</p>";
    });
}

function checkScroll() {
  const scrollPosition = window.innerHeight + window.scrollY;
  const bodyHeight = document.body.offsetHeight;
  const bottomThreshold = 200;

  if (
    scrollPosition >= bodyHeight - bottomThreshold &&
    !isLoading &&
    !allProductsLoaded
  ) {
    loadMoreProducts();
  }
}

loadInitialProducts();

const itemsPerPageSelect = document.getElementById("itemsPerPage");
itemsPerPageSelect.addEventListener("change", function (e) {
  const newPageSize = parseInt(e.target.value);
  handlePageSizeChange(newPageSize);
});

window.addEventListener("scroll", checkScroll);
