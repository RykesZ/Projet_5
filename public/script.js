// Déclaration des variables globales
const result = document.getElementById('result');
const merchList = document.getElementById('merchList');
const cartList = document.getElementById('cartList');
const productPresentation = document.getElementById('productPresentation');
const addCartForm = document.getElementById('addCartForm');
var cartItems = [];
class onSaleProduct {
    constructor(id, count) {
        this.id = id;
        this.count = count;
    }
};

const api = 'http://localhost:3000/api/teddies';

// Initialisation de la variable de session cartItems (contenu du panier, type string) et empêchement de la réinitialiser grâce au passage de initialised en 'true'
// La variable de session cartItems permet de récupérer le contenu du panier de la session à tout moment car elle est permanente dans la session
// Lorsqu'on veut la modifier, on utilise JSON.parse() pour transférer son contenu dans l'array temporaire cartItems, on manipule l'array comme on veut,
// puis on utilise JSON.stringify() pour transférer le contenu de l'array dans la variable permanente à la session
const cartInitialisation = () => {
    if (sessionStorage.getItem('initialised') === 'true') {
        console.log(sessionStorage.getItem('initialised'))
        console.log(sessionStorage.getItem('cartItems'))
    } else {
        console.log(sessionStorage.getItem('initialised'))
        sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
        sessionStorage.setItem('initialised', 'true');
        console.log(sessionStorage.getItem('initialised'))
        console.log(sessionStorage.getItem('cartItems'))
    }
}
cartInitialisation();

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

// Si le formulaire d'ajout au panier existe sur la page, lui ajoute un eventListener de type submit (car vérification de l'entrée d'un nombre d'articles valide), puis
// va récupérer la variable de session cartItems, parser son contenu en un array cartItems, push l'id du produit ajouté au panier dans cet array, 
// stringifyer l'array cartItems pour le stocker dans la variable de session cartItems, et charger la page panier
if (addCartForm !== null) {
    addCartForm.addEventListener('submit', function(event) {
        event.stopPropagation();
        event.preventDefault();
        console.log(cartItems);
        const articleNumber = document.getElementById('articleNumber');

        cartItems = JSON.parse(sessionStorage.getItem('cartItems'));
        console.log(cartItems);
        cartItems.push(sessionStorage.getItem('currentProductId'));
        console.log(cartItems);
        sessionStorage.setItem('cartItems', JSON.stringify(cartItems));
        console.log(cartItems);
        console.log(sessionStorage.getItem('cartItems'));
        window.open('./panier.html', '_self');
    });
}

// Lancée au chargement de la page panier, permet de traduire cartItems en produits visibles sur la page et leur associer le nombre
// qu'il y en a dans le panier et leurs infos. Ex : si l'id 12345 sur retrouve 3 fois dans cartItems, la page affichera une row pour le produit à l'id 12345
// et affichera que 3 exemplaires sont présents dans le panier, ce qui permet de calculer le prix total
async function getCartDetails() {
    try {
        // Déclaration de la variable qui va contenir les types d'articles à afficher sur la page et leur nombre
        let cart = [];
        // Récupère la liste des produits en vente et leurs infos
        const requestPromise = makeRequest('GET', api + '/');
        const productList = await requestPromise;
        // Crée une instance de onSaleProduct dans cart, pour chaque type de produit en vente, et initialise son nombre à 0
        for (let i = 0; i < productList.length; ++i) {
            cart[i] = new onSaleProduct(productList[i]._id, 0);
        }
        // Récupère la variable de session cartItems et transfère son contenu dans l'array temporaire cartItems
        cartItems = JSON.parse(sessionStorage.getItem('cartItems'));


        // Pour chacun des id présents dans cartItems, compare cet id (idTest) avec ceux présents des objets à la vente dans cart (cart[i].onSaleProduct.id).
        // Pour chaque ids identiques, ajoute 1 au count de cet id dans cart.
        cartItems.forEach(function(idTest) {
            for (let i = 0; i < cart.length; ++i) {
                if (idTest === cart[i].onSaleProduct.id) {
                    cart[i].onSaleProduct.count++;
                }
            }
        });

        // Regarde le count de chacun des items à la vente et crée une row sur la page pour chaque count > 0
        // Remplit cette row avec le nom et le prix à l'unité de l'item concerné, ainsi que le nombre de ce type d'item présent dans le panier
        for (let i = 0; i < cart.length; ++i) {
            if (cart[i].onSaleProduct.count < 0) {
                const newProduct = document.createElement("div");
                newProduct.classList.add("row");

                cartList.appendChild(newProduct);
            }
        }

        /*for (let i = 0; i < cartItems.length; ++i) {
            const requestPromise = makeRequest('GET', api + '/' + cartItems[i]);
            const cartItemDetails = await requestPromise;
        }*/
    } catch (errorResponse) {
        
    }
};