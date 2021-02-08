// Déclaration des variables globales
const result = document.getElementById('result');
const merchList = document.getElementById('merchList');
const cartList = document.getElementById('cartList');
const productPresentation = document.getElementById('productPresentation');
const addCartForm = document.getElementById('addCartForm');
const productPrices = [];
const totalPriceText = document.getElementById('totalPrice');
// var cartItems = [];
class onSaleProduct {
    constructor(id, count, price) {
        this.id = id;
        this.count = count;
        this.price = price;
    }
};

const api = 'http://localhost:3000/api/teddies';

// Création de la fonction générique de requête AJAX
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

// Initialisation de la variable de session cartPerma (type de produits en vente et combien 
// par type dans le panier, variable de type string) et s'empêche de se réinitialiser dans la même session
// La variable de session cartPerma permet d'accéder au panier à tout moment dans la session car elle est permanente durant toute la session
// Lorsqu'on veut la modifier, on utilise JSON.parse() pour transférer son contenu dans un array temporaire, on modifie cet array comme on le souhaite, 
// puis on utilise JSON.stringify() pour transférer le contenu de l'array temporaire dans la variable permanente à la session 
async function cartInitialisation() {
    // Si l'array permanent a déjà été initialisé, cette fonction n'a pas d'effet
    if (localStorage.getItem('initialised') === 'true') {
        console.log(localStorage.getItem('initialised'))
        console.log(localStorage.getItem('cartPerma'))
    } else {
        // Déclaration de l'array temporaire qui va servir de modèle à l'array permanent
        let cartTempo = [];
        // Récupère la liste des produits en vente et leurs infos
        const requestPromise = makeRequest('GET', api + '/');
        const productList = await requestPromise;
        // Crée une instance de onSaleProduct dans cartTempo, pour chaque type de produit en vente, et initialise son nombre à 0
        for (let i = 0; i < productList.length; ++i) {
            cartTempo[i] = new onSaleProduct(productList[i]._id, 0, productList[i].price);
        }
        // Stringify l'array temporaire en array permanent en le stockant dans la variable de session cartPerma, et passe initialised en 'true' pour que cette partie ne se répète pas
        localStorage.setItem('cartPerma', JSON.stringify(cartTempo));
        console.log(localStorage.getItem('cartPerma'));
        localStorage.setItem('initialised', 'true');
    }
}
cartInitialisation();

const totalPriceCalc = () => {
    totalPrice = 0;
    let cartTempo = JSON.parse(localStorage.getItem('cartPerma'));
    for (i = 0; i < cartTempo.length; i++) {
        totalPrice += (cartTempo[i].price * cartTempo[i].count);
    }
    totalPriceText.textContent = totalPrice;
    console.log(totalPrice);
};

//Lancée sur la page index (vue de la liste des produits en vente)
// Récupération de la liste des produits en vente, création d'une row sur la page pour chacun d'entre eux, et attribution d'un eventListener pour récupérer l'id 
// du produit choisi se trouvant dans l'attribut id du texte du lien cliqué, et le stocker dans la variable de session currentProductId
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
            linkName.setAttribute("href", "./public/pages/produit.html" + "?id=" + productList[i]._id);
            linkName.appendChild(linkNameTextContent);
            productName.appendChild(linkName);
            newProduct.appendChild(productName);

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

// Lancée sur la page produit
// Fonction permettant à la page produit de récupérer les infos du produit choisi par une requête serveur utilisant l'id contenu dans
// currentProductId, pour les afficher dans la page
async function getProductDetails() {
    try {
        /*let id = localStorage.getItem('currentProductId');*/
        console.log('So far so good A');
        let currentURL = new URL(window.location.href);
        console.log('So far so good B');
        let id = currentURL.searchParams.get('id');
        console.log(id);
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

if (addCartForm !== null) {
    addCartForm.addEventListener('submit', function(event) {
        event.stopPropagation();
        event.preventDefault();
        // Déclaration de l'array temporaire
        let cartTempo = [];
        console.log(cartTempo);
        // Récupération du nombre d'articles à ajouter au panier
        const articleNumber = document.getElementById('articleNumber');
        // Récupération de l'array du panier permanent
        console.log(localStorage.getItem('cartPerma'))
        cartTempo = JSON.parse(localStorage.getItem('cartPerma'));
        console.log(cartTempo);
        // Récupération de l'id du produit actuel en variable à tester
        let currentURL = new URL(window.location.href);
        let idToTest = currentURL.searchParams.get('id');
        // Comparaison entre l'id du produit actuel et ceux de tous les produits en vente jusqu'à trouver le même, puis ajoute le nombre d'articles voulus dans le panier
        for (let i = 0; i < cartTempo.length; i++) {
            if (idToTest === cartTempo[i].id) {
                cartTempo[i].count += parseInt(articleNumber.value);
            }
        }
        // Retransfère l'array temporaire dans l'array permanent
        localStorage.setItem('cartPerma', JSON.stringify(cartTempo));
        console.log(localStorage.getItem('cartPerma'));
        // Envoie vers la page du panier
        window.open('./panier.html', '_self');
    });
}

// Lancée au chargement de la page panier, permet de traduire la variable permanente cartPerma en produits visibles sur la page et leur associer le nombre
// qu'il y en a dans le panier et leurs infos
async function getCartDetails() {
    try {
        // Déclaration de la variable qui va contenir les types d'articles à afficher sur la page et leur nombre
        let cartTempo = [];
        // Récupère la liste des produits en vente et leurs infos
        const requestPromise = makeRequest('GET', api + '/');
        const productList = await requestPromise;
        // Récupère la variable de session cartPerma et transfère son contenu dans l'array temporaire cartTempo
        cartTempo = JSON.parse(localStorage.getItem('cartPerma'));
        console.log(cartTempo);
        console.log(cartList);

        // Initialisation de la variable du prix final
        let totalPrice = 0;

        // Regarde le count de chacun des items à la vente et crée une row sur la page pour chaque count > 0
        // Remplit cette row avec le nom et le prix à l'unité de l'item concerné, ainsi que le nombre de ce type d'item présent dans le panier
        for (let i = 0; i < cartTempo.length; ++i) {
            if (cartTempo[i].count > 0) {
                const newProduct = document.createElement("div");
                newProduct.classList.add("row");

                // Crée la colonne nom du produit concerné avec un lien vers lui
                const productName = document.createElement("div");
                const linkName = document.createElement("a");
                const linkNameTextContent = document.createElement("p");
                productName.classList.add("col-3");
                linkNameTextContent.textContent = productList[i].name;
                /*linkNameTextContent.setAttribute("id", productList[i]._id);*/
                linkName.setAttribute("href", "./produit.html" + "?id=" + productList[i]._id);
                linkName.appendChild(linkNameTextContent);
                productName.appendChild(linkName);
                newProduct.appendChild(productName);
                /*linkName.addEventListener('click', function(event) {
                event.stopPropagation();
                localStorage.setItem('currentProductId', event.target.id);
                });*/

                // Crée la colonne prix du produit concerné
                const productPrice = document.createElement("div");
                productPrice.classList.add("col-3");
                productPrice.textContent = productList[i].price;
                newProduct.appendChild(productPrice);

                // Crée la colonne nombre d'exemplaires produit concerné dans le panier
                const productCount = document.createElement("div");
                productCount.classList.add("col-3");
                const productCountForm = document.createElement("form");
                const productCountLabel = document.createElement("label");
                productCountLabel.setAttribute("for", "articleNumber");
                productCountLabel.textContent = "Currently in cart :";
                const productCountInput = document.createElement("input");
                productCountInput.setAttribute("type", "number");
                productCountInput.setAttribute("name", "number_of_article");
                productCountInput.setAttribute("id", "articleNumber" + i);
                productCountInput.setAttribute("value", cartTempo[i].count);
                productCountInput.setAttribute("min", "1");
                productCountInput.setAttribute("max", "500");
                productCountInput.setAttribute("required", "");
                productCountForm.appendChild(productCountLabel);
                productCountForm.appendChild(productCountInput);
                productCount.appendChild(productCountForm);
                newProduct.appendChild(productCount);
                // Modifie la quantité de produits dans cartTempo en fonction de l'input modifié, puis transfère cette valeur dans cartPerma
                productCountInput.addEventListener("change", function(event) {
                    event.stopPropagation();
                    let idToTest = productList[i]._id;
                    for (let a = 0; a < cartTempo.length; a++) {
                        if (idToTest === cartTempo[a].id) {
                            cartTempo[a].count = productCountInput.value;
                            localStorage.setItem('cartPerma', JSON.stringify(cartTempo));
                            console.log(cartTempo);
                            totalPriceCalc();
                        };
                    };
                });

                // Crée le bouton de suppression du type d'article du panier
                const removeArticle = document.createElement("div");
                removeArticle.classList.add("col-3");
                const removeButton = document.createElement("button");
                removeArticle.appendChild(removeButton);
                removeButton.setAttribute("type", "button");
                removeButton.textContent = "Remove";
                removeButton.addEventListener("click", function(event) {
                    event.stopPropagation()
                    // Retire les articles du count correspondant dans le panier

                    // Récupération de l'id du produit actuel en variable à tester
                    let idToTest = productList[i]._id;
                    // Comparaison entre l'id du produit de la row et ceux de tous les produits en vente jusqu'à trouver le même, puis retire tous les articles de ce type du panier
                    for (let a = 0; a < cartTempo.length; a++) {
                        if (idToTest === cartTempo[a].id) {
                            cartTempo[a].count = 0;
                            // Retransfère l'array temporaire dans l'array permanent
                            localStorage.setItem('cartPerma', JSON.stringify(cartTempo));
                            console.log(cartTempo);
                        }
                    }
                    // Retire la row de la page
                    cartList.removeChild(newProduct);
                    totalPriceCalc();
                });
                newProduct.appendChild(removeArticle);
                // Ajoute la row à la page
                cartList.appendChild(newProduct);
            }
        }
        // Affiche le prix final sur la page
        totalPriceCalc();
        // Vide le panier et recharge la page
        const emptyButton = document.getElementById("emptyButton");
        emptyButton.addEventListener("click", function(event) {
            event.stopPropagation();
            for (i = 0; i < cartTempo.length; i++) {
                cartTempo[i].count = 0;
            }
            localStorage.setItem('cartPerma', JSON.stringify(cartTempo));
            document.location.reload();
        });
        console.log('Everything went right');
    } catch (errorResponse) {
        console.log('Something went wrong');
    }
};