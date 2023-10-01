/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ("use strict");

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
      cartProduct: "#template-cart-product", // CODE ADDED
    },
    containerOf: {
      menu: "#product-list",
      cart: "#cart",
    },
    all: {
      menuProducts: "#product-list > .product",
      menuProductsActive: "#product-list > .product.active",
      formInputs: "input, select",
    },
    menuProduct: {
      clickable: ".product__header",
      form: ".product__order",
      priceElem: ".product__total-price .price",
      imageWrapper: ".product__images",
      amountWidget: ".widget-amount",
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: "input.amount", // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: ".cart__order-summary",
      toggleTrigger: ".cart__summary",
      totalNumber: `.cart__total-number`,
      totalPrice:
        ".cart__total-price strong, .cart__order-total .cart__order-price-sum strong",
      subtotalPrice: ".cart__order-subtotal .cart__order-price-sum strong",
      deliveryFee: ".cart__order-delivery .cart__order-price-sum strong",
      form: ".cart__order",
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: ".widget-amount",
      price: ".cart__product-price",
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: "active",
      imageVisible: "active",
    },
    // CODE ADDED START
    cart: {
      wrapperActive: "active",
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: "//localhost:3131",
      products: "products",
      orders: "orders",
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    // CODE ADDED START
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      this.id = id;
      this.data = data;

      this.renderInMenu();
      this.getElements();
      this.initAccordion();
      this.initOrderForm();
      this.initAmountWidget();
      this.processOrder();
    }

    renderInMenu() {
      this.dom = {};
      const genreratedHTML = templates.menuProduct(this.data);
      this.dom.wrapper = utils.createDOMFromHTML(genreratedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(this.dom.wrapper);
    }

    getElements() {
      this.dom.accordionTrigger = this.dom.wrapper.querySelector(
        select.menuProduct.clickable
      );
      this.dom.form = this.dom.wrapper.querySelector(select.menuProduct.form);
      this.dom.formInputs = this.dom.form.querySelectorAll(
        select.all.formInputs
      );
      this.dom.cartButton = this.dom.wrapper.querySelector(
        select.menuProduct.cartButton
      );
      this.dom.price = this.dom.wrapper.querySelector(
        select.menuProduct.priceElem
      );
      this.dom.imageWrapper = this.dom.wrapper.querySelector(
        select.menuProduct.imageWrapper
      );
      this.dom.amountWidget = this.dom.wrapper.querySelector(
        select.menuProduct.amountWidget
      );
    }

    initAccordion() {
      const activeClass = classNames.menuProduct.wrapperActive;
      this.dom.accordionTrigger.addEventListener("click", () => {
        if (this.dom.wrapper.classList.contains(activeClass)) {
          return this.dom.wrapper.classList.remove(activeClass);
        } else {
          [...document.querySelectorAll(".product")].map((product) =>
            product.classList.remove(activeClass)
          );
          this.dom.wrapper.classList.add(activeClass);
        }
      });
    }

    initOrderForm() {
      this.dom.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.processOrder();
      });

      for (let input of this.dom.formInputs) {
        input.addEventListener("change", () => {
          this.processOrder();
        });
      }

      this.dom.cartButton.addEventListener("click", (e) => {
        e.preventDefault();
        this.processOrder();
        this.addToCart();
      });
    }

    initAmountWidget() {
      this.amountWidget = new AmountWidget(this.dom.amountWidget);
      this.dom.amountWidget.addEventListener("updated", () => {
        this.processOrder();
      });
    }

    processOrder() {
      const { form, imageWrapper } = this.dom;
      let price = this.data.price;
      const formData = utils.serializeFormToObject(form);

      [...imageWrapper.children].map((image) => {
        if (image.classList.length > 1) {
          image.classList.remove(classNames.menuProduct.imageVisible);
        }
      });
      for (const paramId in formData) {
        formData[paramId].map((option) => {
          const image = imageWrapper.querySelector(`.${paramId}-${option}`);
          if (image) {
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        });
      }

      this.productOptions = {};

      for (const paramId in this.data.params) {
        const param = this.data.params[paramId];
        this.productOptions[paramId] = { label: param.label, options: {} };
        for (let optionId in param.options) {
          const option = param.options[optionId];
          if (formData[paramId].includes(optionId)) {
            this.productOptions[paramId].options[optionId] = option.label;
            if (!option.default) {
              price += option.price;
            }
          } else {
            if (option.default) {
              price -= option.price;
            }
          }
        }
      }

      this.priceSingle = price;
      this.price = price * this.amountWidget.value;
      this.dom.price.innerHTML = price;
    }

    addToCart() {
      app.cart.add(this.prepareCartProduct());
    }

    prepareCartProduct() {
      const productSummary = {
        id: this.id,
        name: this.data.name,
        amount: this.amountWidget.value,
        price: this.price,
        priceSingle: this.priceSingle,
        params: this.productOptions,
      };
      return productSummary;
    }
  }

  class AmountWidget {
    constructor(element) {
      this.getElements(element);
      this.setValue(settings.amountWidget.defaultValue);
      this.initActions();
    }

    getElements(element) {
      this.element = element;
      this.input = this.element.querySelector(select.widgets.amount.input);
      this.linkDecrease = this.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      this.linkIncrease = this.element.querySelector(
        select.widgets.amount.linkIncrease
      );
    }

    setValue(value) {
      const newValue = parseInt(value);
      if (
        !isNaN(newValue) &&
        newValue >= settings.amountWidget.defaultMin &&
        newValue <= settings.amountWidget.defaultMax
      ) {
        this.value = newValue;
        this.announce();
      }
      this.input.value = this.value;
    }

    initActions() {
      this.input.addEventListener("change", (e) => {
        this.setValue(e.target.value);
      });
      this.linkDecrease.addEventListener("click", () => {
        this.setValue(this.value - 1);
      });
      this.linkIncrease.addEventListener("click", () => {
        this.setValue(this.value + 1);
      });
    }

    announce() {
      const event = new CustomEvent("updated", { bubbles: true });
      this.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      this.orderDetails = {};
      this.products = [];
      this.getElements(element);
      this.initActions();
    }

    getElements(element) {
      this.dom = {};
      this.dom.wrapper = element;
      this.dom.toggleTrigger = this.dom.wrapper.querySelector(
        select.cart.toggleTrigger
      );
      this.dom.productList = this.dom.wrapper.querySelector(
        select.cart.productList
      );
      this.dom.deliveryFee = this.dom.wrapper.querySelector(
        select.cart.deliveryFee
      );
      this.dom.subtotalPrice = this.dom.wrapper.querySelector(
        select.cart.subtotalPrice
      );
      this.dom.totalPrice = this.dom.wrapper.querySelectorAll(
        select.cart.totalPrice
      );
      this.dom.totalNumber = this.dom.wrapper.querySelector(
        select.cart.totalNumber
      );
      this.dom.form = this.dom.wrapper.querySelector(select.cart.form);
      this.dom.phone = this.dom.wrapper.querySelector(select.cart.phone);
      this.dom.address = this.dom.wrapper.querySelector(select.cart.address);
    }

    initActions() {
      this.dom.toggleTrigger.addEventListener("click", () => {
        this.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      this.dom.productList.addEventListener("updated", () => {
        this.update();
      });
      this.dom.productList.addEventListener("remove", (e) => {
        console.log(e);
        this.products = this.products.filter(
          (product) => product !== e.detail.cartProduct
        );
        this.update();
      });
      this.dom.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.sendOrder();
      });
      this.dom.phone.addEventListener("change", (e) => {
        this.orderDetails.phone = e.target.value;
      });
      this.dom.address.addEventListener("change", (e) => {
        this.orderDetails.address = e.target.value;
      });
    }

    add(menuProduct) {
      const genreratedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(genreratedHTML);
      this.dom.productList.appendChild(generatedDOM);
      this.products.push(new CartProduct(menuProduct, generatedDOM));
      this.update();
    }

    update() {
      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;

      for (const product of this.products) {
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }

      this.totalPrice = subtotalPrice;

      if (totalNumber > 0) {
        this.totalPrice += deliveryFee;
        this.dom.deliveryFee.innerHTML = deliveryFee;
      } else {
        this.dom.deliveryFee.innerHTML = 0;
      }

      this.dom.totalNumber.innerHTML = totalNumber;
      [...this.dom.totalPrice].map(
        (elem) => (elem.innerHTML = this.totalPrice)
      );
      this.dom.subtotalPrice.innerHTML = subtotalPrice;

      const details = {
        totalPrice: this.totalPrice,
        subtotalPrice,
        totalNumber,
        deliveryFee,
        products: this.products.map((product) => product.getData()),
      };
      Object.assign(this.orderDetails, details);
    }

    sendOrder() {
      const url = settings.db.url + "/" + settings.db.orders;
      const payload = this.orderDetails;
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      Object.assign(this, menuProduct);
      this.getElements(element);
      this.initAmountWidget();
      this.initActions();
    }

    getElements(element) {
      this.dom = { wrapper: element };
      const elements = {
        amountWidget: this.dom.wrapper.querySelector(
          select.cartProduct.amountWidget
        ),
        price: this.dom.wrapper.querySelector(select.cartProduct.price),
        edit: this.dom.wrapper.querySelector(select.cartProduct.edit),
        remove: this.dom.wrapper.querySelector(select.cartProduct.remove),
      };
      Object.assign(this.dom, elements);
    }

    getData() {
      return {
        id: this.id,
        name: this.name,
        amount: this.amount,
        params: this.params,
        price: this.price,
      };
    }

    initActions() {
      this.dom.remove.addEventListener("click", () => {
        this.remove();
      });

      this.dom.edit.addEventListener("click", () => {
        this.edit();
      });
    }

    initAmountWidget() {
      this.amountWidget = new AmountWidget(this.dom.amountWidget);
      this.amountWidget.setValue(this.amount);
      this.dom.amountWidget.addEventListener("updated", () => {
        this.amount = this.amountWidget.value;
        this.price = this.priceSingle * this.amount;

        this.dom.price.innerHTML = this.price;
      });
    }

    remove() {
      const event = new CustomEvent("remove", {
        bubbles: true,
        detail: {
          cartProduct: this,
        },
      });
      this.dom.wrapper.dispatchEvent(event);
      this.dom.wrapper.remove();
    }

    edit() {}
  }

  const app = {
    initMenu: function () {
      for (let productData in this.data) {
        new Product(productData, this.data[productData]);
      }
    },

    initCart: function () {
      const cartElem = document.querySelector(select.containerOf.cart);
      this.cart = new Cart(cartElem);
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
}
