const BASE_URL = "https://brandstestowy.smallhost.pl/api";

const menu = document.getElementById("menu");

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
      <div class="product-card">
        <div class="product-image">
          <img src="${product.image}" alt="${product.text}">
          ${
            product.badge
              ? `<div class="badge ${badgeClass}">${product.badge}</div>`
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

async function fetchProducts(pageNumber = 1, pageSize = 16) {
  try {
    const response = await fetch(`${BASE_URL}/random`);
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
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
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
  });

  fetchProducts();

  document
    .querySelector(".product-swiper")
    .addEventListener("click", function (e) {
      const heartIcon = e.target.closest(".heart-icon");
      if (heartIcon) {
        heartIcon.classList.toggle("active");
      }
    });
});

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
