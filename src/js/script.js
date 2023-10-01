/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ("use strict");

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: "active",
      imageVisible: "active",
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
  };

  class Product {
    constructor(id, data) {
      this.id = id;
      this.data = data;

      this.renderInMenu();

      this.accordionTrigger = this.element.querySelector(
        select.menuProduct.clickable
      );
      this.form = this.element.querySelector(select.menuProduct.form);
      this.formInputs = this.form.querySelectorAll(select.all.formInputs);
      this.cartButton = this.element.querySelector(
        select.menuProduct.cartButton
      );
      this.priceElem = this.element.querySelector(select.menuProduct.priceElem);

      this.initAccordion();
      this.initOrderForm();
      this.processOrder();
    }

    renderInMenu() {
      const genreratedHTML = templates.menuProduct(this.data);
      this.element = utils.createDOMFromHTML(genreratedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(this.element);
    }

    initAccordion() {
      const activeClass = classNames.menuProduct.wrapperActive;
      this.accordionTrigger.addEventListener("click", () => {
        if (this.element.classList.contains(activeClass)) {
          return this.element.classList.remove(activeClass);
        } else {
          [...document.querySelectorAll(".product")].map((product) =>
            product.classList.remove(activeClass)
          );
          this.element.classList.add(activeClass);
        }
      });
    }

    initOrderForm() {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.processOrder();
      });

      for (let input of this.formInputs) {
        input.addEventListener("change", () => {
          this.processOrder();
        });
      }

      this.cartButton.addEventListener("click", (e) => {
        e.preventDefault();
        this.processOrder();
      });
    }

    processOrder() {
      let price = this.data.price;
      const formData = utils.serializeFormToObject(this.form);

      for (const paramId in this.data.params) {
        const param = this.data.params[paramId];
        for (let optionId in param.options) {
          const option = param.options[optionId];
          if (formData[paramId].includes(optionId)) {
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

      this.priceElem.innerHTML = price;
    }
  }

  const app = {
    initMenu: function () {
      for (let productData in this.data.products) {
        new Product(productData, this.data.products[productData]);
      }
    },

    initData: function () {
      this.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      console.log("*** App starting ***");
      console.log("thisApp:", thisApp);
      console.log("classNames:", classNames);
      console.log("settings:", settings);
      console.log("templates:", templates);

      this.initData();
      this.initMenu();
    },
  };

  app.init();
}
