// Déclaration des variables globales
const result = document.getElementById('result');
const merchList = document.getElementById('merchList');
const cartList = document.getElementById('cartList');
const productPresentation = document.getElementById('productPresentation');
const addCartForm = document.getElementById('addCartForm');
const totalPriceText = document.getElementById('totalPrice');
// var cartItems = [];
class onSaleProduct {
    constructor(id, count) {
        this.id = id;
        this.count = count;
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
    if (sessionStorage.getItem('initialised') === 'true') {
        console.log(sessionStorage.getItem('initialised'))
        console.log(sessionStorage.getItem('cartPerma'))
    } else {
        // Déclaration de l'array temporaire qui va servir de modèle à l'array permanent
        let cartTempo = [];
        // Récupère la liste des produits en vente et leurs infos
        const requestPromise = makeRequest('GET', api + '/');
        const productList = await requestPromise;
        // Crée une instance de onSaleProduct dans cartTempo, pour chaque type de produit en vente, et initialise son nombre à 0
        for (let i = 0; i < productList.length; ++i) {
            cartTempo[i] = new onSaleProduct(productList[i]._id, 0);
        }
        // Stringify l'array temporaire en array permanent en le stockant dans la variable de session cartPerma, et passe initialised en 'true' pour que cette partie ne se répète pas
        sessionStorage.setItem('cartPerma', JSON.stringify(cartTempo));
        console.log(sessionStorage.getItem('cartPerma'));
        sessionStorage.setItem('initialised', 'true');
    }
}
cartInitialisation();




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

// Lancée sur la page produit
// Fonction permettant à la page produit de récupérer les infos du produit choisi par une requête serveur utilisant l'id contenu dans
// currentProductId, pour les afficher dans la page
async function getProductDetails() {
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
        cartTempo = JSON.parse(sessionStorage.getItem('cartPerma'));
        console.log(cartTempo);
        // Récupération de l'id du produit actuel en variable à tester
        let idToTest = sessionStorage.getItem('currentProductId');
        // Comparaison entre l'id du produit actuel et ceux de tous les produits en vente jusqu'à trouver le même, puis ajoute le nombre d'articles voulus dans le panier
        for (let i = 0; i < cartTempo.length; i++) {
            if (idToTest === cartTempo[i].id) {
                cartTempo[i].count += parseInt(articleNumber.value);
            }
        }
        // Retransfère l'array temporaire dans l'array permanent
        sessionStorage.setItem('cartPerma', JSON.stringify(cartTempo));
        console.log(sessionStorage.getItem('cartPerma'));
        // Envoie vers la page du panier
        window.open('./panier.html', '_self');
    });
}












// Lancée au chargement de la page panier, permet de traduire cartItems en produits visibles sur la page et leur associer le nombre
// qu'il y en a dans le panier et leurs infos. Ex : si l'id 12345 sur retrouve 3 fois dans cartItems, la page affichera une row pour le produit à l'id 12345
// et affichera que 3 exemplaires sont présents dans le panier, ce qui permet de calculer le prix total
async function getCartDetails() {
    try {
        // Déclaration de la variable qui va contenir les types d'articles à afficher sur la page et leur nombre
        let cartTempo = [];
        // Récupère la liste des produits en vente et leurs infos
        const requestPromise = makeRequest('GET', api + '/');
        const productList = await requestPromise;
        // Récupère la variable de session cartItems et transfère son contenu dans l'array temporaire cartItems
        cartTempo = JSON.parse(sessionStorage.getItem('cartPerma'));
        console.log(cartTempo);

        console.log('So far so good 1');

        console.log('So far so good 3');

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
                linkNameTextContent.setAttribute("id", productList[i]._id);
                linkName.setAttribute("href", "./produit.html");
                linkName.appendChild(linkNameTextContent);
                productName.appendChild(linkName);
                newProduct.appendChild(productName);
                linkName.addEventListener('click', function(event) {
                event.stopPropagation();
                sessionStorage.setItem('currentProductId', event.target.id);
                });

                // Crée la colonne prix du produit concerné
                const productPrice = document.createElement("div");
                productPrice.classList.add("col-3");
                productPrice.textContent = productList[i].price;
                newProduct.appendChild(productPrice);

                // Crée la colonne nombre d'exemplaires produit conerné dans le panier
                const productCount = document.createElement("div");
                productCount.classList.add("col-3");
                productCount.textContent = cartTempo[i].count;
                newProduct.appendChild(productCount);

                // Ajoute la row à la page
                cartList.appendChild(newProduct);

                console.log(totalPrice);
                // Calcule le nouveau prix total avec les articles ajoutés
                totalPrice += (productList[i].price * cartTempo[i].count);
            }
            // Affiche le prix final sur la page
            totalPriceText.textContent = totalPrice;
        }
        console.log('Everything went right');
    } catch (errorResponse) {
        console.log('Something went wrong');
    }
};