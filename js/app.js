// variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDom = document.querySelector(".products-center");

// cart 
let cart = [];

// cart buttons
let buttonsDom = [];

// getting the products
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json"); // fetch data and return promise object
            let json = await result.json(); // from promise to json

            let products = json.items; // json.items is object array

            products = products.map(itemInProducts => { // looping each item in products array, map to simple object and return object array
                const { title, price } = itemInProducts.fields;
                const { id } = itemInProducts.sys;
                const image = itemInProducts.fields.image.fields.file.url;
                return { title, price, id, image };
            });

            return products; // object array

        } catch (error) {
            console.log(error);
        }
    }
}

// display products
class UI {
    displayProduct(products) {
        let productUI = "";
        products.forEach(product => { // looping each product in products array and generating each product in gird
            productUI += `
            <!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img src = ${product.image} class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>

                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!-- end of single product -->
            `;
        });
        productsDom.innerHTML = productUI;
    }

    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];// get NodeList and spread in an array
        buttonsDom = buttons;// set btn array to buttonsDom array for checking item in a cart or not there.

        buttons.forEach(button => {
            let id = button.dataset.id;
            let itemInCart = cart.find(item => item.id === id);// Initially cart array is empty
            if (itemInCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }

            // if there is no item in cart array and user clicks the 'Add to Cart' button
            button.addEventListener("click", event => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;

                // get product from products and spread object fiels and add one more field name 'amount'
                let cartItems = { ...Storage.getProduct(id), amount: 1 };

                // add product to the cart
                cart = [...cart, cartItems];

                // save cart in local storage
                Storage.saveCart(cart);

                // set cart values
                this.setCartValues(cart);

                // display cart item
                this.displayCartItem(cartItems);

                // show the cart
                this.showCart();
            });
        });
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;

        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });

        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));// cartTotal exist in navbar
        cartItems.innerText = itemsTotal;// cartItems exist in cart
    }

    displayCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <img src=${item.image} alt="product">
            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
        `;
        cartContent.appendChild(div);
    }

    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDom.classList.add("showCart");
    }

    setupAPP() {
        cart = Storage.getCart();// get cart from localStorage
        this.setCartValues(cart);// set items in cart total price and total item
        this.populateCart(cart);// set cart items array from localStorage in cart
        cartBtn.addEventListener('click', this.showCart);// if user clicks the cart icon on navbar
        closeCartBtn.addEventListener('click', this.hideCart);// if user clicks the close button on cart
    }

    // set cart items array from localStorage in cart
    populateCart(cart) {
        cart.forEach(item => this.displayCartItem(item));
    }

    // card hidding function
    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDom.classList.remove("showCart");
    }

    // cart logic 
    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        })
    }

    clearCart() {
        let cartItemIds = cart.map(item => item.id);
        cartItemIds.forEach(id => this.removeItem(id));
        console.log(cartContent.children);

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }

        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }

    getSingleButton(id) {
        return buttonsDom.find(button => button.dataset.id === id);
    }

}

// local storage
class Storage {
    // save products to local storage
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    // get product form the products
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id);
    }

    // save cart to locaStorage
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // if cart is already exit in Local Storage or not return empty array
    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    ui.setupAPP();

    // get all products and save in local storage
    products.getProducts().then(products => {
        ui.displayProduct(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});