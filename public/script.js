const result = document.getElementById('result');
const merchList = document.getElementById('merchList');
const productPresentation = document.getElementById('productPresentation');
const addCartButton = document.getElementById('addCart');
var cartItems = [];
sessionStorage.setItem('initialised', 'false');

const api = 'http://localhost:3000/api/teddies';

const cartInitialisation = () => {
    if (sessionStorage.getItem('initialised') === 'false') {
        sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
        sessionStorage.setItem('initialised', 'true');
    }
}

cartInitialisation();

function makeRequest(verb, url, data) {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open(verb, url);
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200 || request.status === 201) {
                    resolve(JSON.parse(request.response));
                } else {
                    reject(JSON.parse(request.response));
                }
            }
        };
        if (verb === 'POST') {
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(data));
        } else {
            request.send();
        }
    });
}

/*const getCurrentProductId = (event) => {
    event.stopPropagation();
    currentProductId = event.target.id;
};*/

async function getProductList() {
    try {
        const requestPromise = makeRequest('GET', api + '/');
        const productList = await requestPromise;
        for (let i = 0; i < productList.length; ++i) {
            const newProduct = document.createElement("div");
            newProduct.classList.add("row");

            const productName = document.createElement("div");
            const linkName = document.createElement("a");
            const linkNameTextContent = document.createElement("p");
            productName.classList.add("col-3");
            linkNameTextContent.textContent = productList[i].name;
            linkNameTextContent.setAttribute("id", productList[i]._id);
            linkName.setAttribute("href", "./public/pages/produit.html");
            linkName.appendChild(linkNameTextContent);
            productName.appendChild(linkName);
            newProduct.appendChild(productName);
            linkName.addEventListener('click', function(event) {
                event.stopPropagation();
                sessionStorage.setItem('currentProductId', event.target.id);
            });

            const productDescription = document.createElement("div");
            productDescription.classList.add("col-3");
            productDescription.textContent = productList[i].description;
            newProduct.appendChild(productDescription);

            const productPrice = document.createElement("div");
            productPrice.classList.add("col-1");
            productPrice.textContent = productList[i].price;
            newProduct.appendChild(productPrice);

            const productImage = document.createElement("div");
            productImage.classList.add("col-3");
            const imageContent = document.createElement("img");
            imageContent.setAttribute("src", productList[i].imageUrl);
            imageContent.setAttribute("alt", "Ours en peluche");
            imageContent.classList.add("thumbnail");
            productImage.appendChild(imageContent);
            newProduct.appendChild(productImage);

            merchList.appendChild(newProduct);
        }
    } catch (errorResponse) {
        //result.textContent = errorResponse.error;
    };
};

async function getProductDetails(id) {
    try {
        let id = sessionStorage.getItem('currentProductId');
        const requestPromise = makeRequest('GET', api + '/' + id);
        const productDetails = await requestPromise;

        const imageHolder = document.getElementById('productImage');
        const nameHolder = document.getElementById('name');
        const priceHolder = document.getElementById('price');
        const descriptionHolder = document.getElementById('description');
        const colorChoice = document.getElementById('color');

        imageHolder.setAttribute('src', productDetails.imageUrl);
        imageHolder.classList.add('productImage');
        nameHolder.textContent = productDetails.name;
        priceHolder.textContent = productDetails.price;
        descriptionHolder.textContent = productDetails.description;

        for (let i = 0; i < productDetails.colors.length; ++i) {
            const newOption = document.createElement('option');
            newOption.setAttribute('value', productDetails.colors[i]);
            newOption.textContent = productDetails.colors[i];
            colorChoice.appendChild(newOption);
        }

    } catch (errorResponse) {
        //result.textContent = errorResponse.error;
    };
};

addCartButton.addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    cartItems = JSON.parse(sessionStorage.getItem('cartItems'));
    cartItems.push(sessionStorage.getItem('currentProductId'));
    sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
    console.log(cartItems);
    console.log(sessionStorage.getItem('cartItems'));
    //window.open('./panier.html', '_self');
});

async function getCartDetails() {
    try {
        cartItems = JSON.parse(sessionStorage.getItem('cartItems'));
        console.log(cartItems);
        for (let i = 0; i < cartItems.length; ++i) {
            const requestPromise = makeRequest('GET', api + '/' + cartItems[i]);
            const cartItemDetails = await requestPromise;
        }
    } catch (errorResponse) {
        
    }
};