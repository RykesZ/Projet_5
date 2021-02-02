const result = document.getElementById('result');
const merchList = document.getElementById('merchList');
const productPresentation = document.getElementById('productPresentation');
let currentProductId;

const api = 'http://localhost:3000/api/teddies';

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

const getCurrentProductId = (event) => {
    event.stopPropagation();
    currentProductId = event.target.id;
};

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
            linkName.setAttribute("id", productList[i]._id);
            linkName.setAttribute("href", "./public/pages/produit.html");
            linkName.appendChild(linkNameTextContent);
            productName.appendChild(linkName);
            newProduct.appendChild(productName);

            //linkName.addEventListener('click', getCurrentProductId());

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
            imageContent.setAttribute("src", productList[i].imageUrl)
            imageContent.setAttribute("alt", "Ours en peluche")
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
        const requestPromise = makeRequest('GET', api + '/:_' + currentProductId);
        const productDetails = await requestPromise;

        const newProduct = document.createElement("div");
        newProduct.classList.add("row");
        const verifId = document.createElement("div");
        verifId.classList.add("col");
        verifId.textContent = currentProductId;

        newProduct.appendChild(verifId);
        productPresentation.appendChild(newProduct);

    } catch (errorResponse) {
        //result.textContent = errorResponse.error;
    };
};