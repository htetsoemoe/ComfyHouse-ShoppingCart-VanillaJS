// variables

const cartBtn = document.querySelector(".cart-btn");
const closeBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".close-cart");
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
            button.addEventListener("click", event => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;

                // get product from products
                // add product to the cart
                // save cart in local storage
                // set cart values
                // display cart item
                // show the cart
            });
        })
    }
}

// local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    // get all products and save in local storage
    products.getProducts().then(products => {
        ui.displayProduct(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
    });
});