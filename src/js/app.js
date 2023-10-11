import { settings, select, classNames, templates } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";

const app = {
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
  },
};

app.init();
