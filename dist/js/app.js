import { settings, select, classNames, templates } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import Booking from "./components/Booking.js";

const app = {
  initPages: function () {
    this.pages = [...document.querySelector(select.containerOf.pages).children];
    this.navLinks = [...document.querySelectorAll(select.nav.links)];

    const idFromHash = window.location.hash.replace("#/", "");
    const defaultPage = this.pages.find((page) => page.id === idFromHash);
    const defaultPageId = defaultPage ? defaultPage.id : this.pages[0].id;
    this.activatePage(defaultPageId);

    this.navLinks.map((link) =>
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const pageId = e.target.getAttribute("href").replace("#", "");
        this.activatePage(pageId);
        window.location.hash = `#/${pageId}`;
      })
    );
  },

  activatePage: function (pageId) {
    this.pages.map((page) => page.classList.toggle(classNames.pages.active, page.id == pageId));
    this.navLinks.map((link) =>
      link.classList.toggle(classNames.nav.active, link.getAttribute("href") == `#${pageId}`)
    );
  },

  initMenu: function () {
    for (let productData in this.data) {
      new Product(productData, this.data[productData]);
    }
  },

  initCart: function () {
    const cartElem = document.querySelector(select.containerOf.cart);
    this.cart = new Cart(cartElem);

    this.productList = document.querySelector(select.containerOf.menu);

    this.productList.addEventListener("add-to-cart", (e) => {
      app.cart.add(e.detail.product);
    });
  },

  initData: function () {
    const url = settings.db.url + "/" + settings.db.products;
    return fetch(url)
      .then((res) => res.json())
      .then((res) => (this.data = res));
  },

  initBooking: function () {
    this.bookingWrapper = document.querySelector(select.containerOf.booking);
    this.booking = new Booking(this.bookingWrapper);
  },

  init: async function () {
    const thisApp = this;
    console.log("*** App starting ***");
    console.log("thisApp:", thisApp);
    console.log("classNames:", classNames);
    console.log("settings:", settings);
    console.log("templates:", templates);

    await this.initData();
    this.initMenu();
    this.initCart();
    this.initPages();
    this.initBooking();
  },
};

app.init();
