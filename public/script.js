// Déclaration des variables globales
const result = document.getElementById('result');
const merchList = document.getElementById('merchList');
const cartList = document.getElementById('cartList');
//const productPresentation = document.getElementById('productPresentation');
const addCartForm = document.getElementById('addCartForm');
const orderForm = document.getElementById('orderForm');
const productPrices = [];
const totalPriceText = document.getElementById('totalPrice');
// Création de la classe d'objets en vente qui sera utilisée dans les paniers temporaire et permanent
class onSaleProduct {
    constructor(id, count, price) {
        this.id = id;
        this.count = count;
        this.price = price;
    }
};

const api = 'http://localhost:3000/api/teddies';

// Fonctions génériques :

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
};

// Fonction qui permet de récupérer la variable locale cartPerma et de renvoyer son résultat parsé
const getCartPerma = () => {
    let cartTempo = JSON.parse(localStorage.getItem('cartPerma'));
    return cartTempo;
};

// Fonction qui permet de stringify le cartTempo pour le stocker dans la variable locale cartPerma
const setCartperma = (cartTempo) => {
    localStorage.setItem('cartPerma', JSON.stringify(cartTempo));
};

// Fonction qui permet de récupérer la liste des produits en vente et leurs infos
async function requestProductList() {
    const requestPromise = makeRequest('GET', api + '/');
    const productList = await requestPromise;
    return productList;
};

// Fonction qui permet de récupérer les infos du produit choisi à partir de son id
async function requestProductDetails(id) {
    const requestPromise = makeRequest('GET', api + '/' + id);
    const productDetails = await requestPromise;
    return productDetails;
};

// Fonction qui permet d'envoyer les infos de la commande et de récupérer l'id de confirmation de commande
async function requestOrderConfirmation(data) {
    const requestPromise = makeRequest('POST', api + '/order', data);
    const orderConfirmation = await requestPromise;
    return orderConfirmation;
};

// Initialisation de la variable locale cartPerma (type de produits en vente et combien 
// par type dans le panier, variable de type string) et s'empêche de se réinitialiser à chaque chargement
// La variable locale cartPerma permet d'accéder au panier à tout moment car elle stockée localement dans le navigateur
// Lorsqu'on veut la modifier, on utilise JSON.parse() pour transférer son contenu dans un array temporaire, on modifie cet array comme on le souhaite, 
// puis on utilise JSON.stringify() pour transférer le contenu de l'array temporaire dans la variable locale 
async function cartInitialisation() {
    // Si l'array permanent cartPerma a déjà été initialisé, cette fonction n'a pas d'effet
    if (localStorage.getItem('initialised') === 'true') {
        console.log(localStorage.getItem('initialised'))
        console.log(localStorage.getItem('cartPerma'))
    } else {
        // Déclaration de l'array temporaire qui va servir de modèle à l'array permanent
        let cartTempo = [];
        // Récupère la liste des produits en vente et leurs infos
        const productList = await requestProductList();
        // Crée une instance de onSaleProduct dans cartTempo, pour chaque type de produit en vente, et initialise son nombre à 0
        for (let i = 0; i < productList.length; ++i) {
            cartTempo[i] = new onSaleProduct(productList[i]._id, 0, productList[i].price);
        }
        // Stringify l'array temporaire en array permanent en le stockant dans la variable locale cartPerma, et passe initialised en 'true' pour que cette partie ne se répète pas
        setCartperma(cartTempo);
        console.log(localStorage.getItem('cartPerma'));
        localStorage.setItem('initialised', 'true');
    }
};

// Fonction de calcul du prix total du panier : récupère index par index le prix de l'item et son nombre dans le panier,
// multiplie les deux et ajoute le résultat au prix total
const totalPriceCalc = () => {
    totalPrice = 0;
    let cartTempo = getCartPerma();
    for (i = 0; i < cartTempo.length; i++) {
        totalPrice += (cartTempo[i].price * cartTempo[i].count);
    }
    return totalPrice;
};

// Fonction assurant que les input de l'utilisateur sont correctement convertis en une chaîne de caractères utilisable pour une URL
const fixedEncodeURIComponent = (str) => {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
  };

// Fonction qui ajoute un eventListener submit sur le formulaire d'ajout du nombre d'articles voulus au panier s'il existe sur la page
const checkDoesArticleFormExist = () => {
    if (addCartForm !== null) {
        addCartForm.addEventListener('submit', function(event) {
            event.stopPropagation();
            event.preventDefault();
            // Récupération du nombre d'articles à ajouter au panier
            const articleNumber = document.getElementById('articleNumber');
            // Récupération de l'array du panier permanent
            let cartTempo = getCartPerma();
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
            setCartperma(cartTempo);
            console.log(localStorage.getItem('cartPerma'));
            // Envoie vers la page du panier
            window.open('./panier.html', '_self');
        });
    };
};

// Fonction qui ajoute un eventListener submit sur le formulaire de commande s'il existe sur la page
const checkDoesOrderFormExist = () => {
    if (orderForm !== null) {
        orderForm.addEventListener('submit', function(event) {
            event.stopPropagation();
            event.preventDefault();
            // Récupère dans des const les champs de formulaire et un éventuel message d'alerte
            const alertExists = document.getElementById('alertMessage');
            const firstName = document.getElementById('firstName');
            const lastName = document.getElementById('lastName');
            const address = document.getElementById('address'); 
            const city = document.getElementById('city');
            const email = document.getElementById('email');
            // Prépare l'URL de la page de confirmation avec les informations des champs de formulaire en paramètres
            const orderURL = "./confirmation.html" + "?" + "firstName=" + fixedEncodeURIComponent(firstName.value) + "&lastName=" + fixedEncodeURIComponent(lastName.value) + "&address=" + fixedEncodeURIComponent(address.value) + "&city=" + fixedEncodeURIComponent(city.value) + "&email=" + fixedEncodeURIComponent(email.value);
            // Si le prix du panier > 0 (= panier n'est pas vide), ouvre la page de confirmation de commande avec l'URL préparée, sinon si
            // un message d'alerte n'existe pas encore, en crée un pour signaler à l'utilisateur qu'il ne peut pas commander un panier vide
            if (totalPriceCalc() > 0) {
                window.open(orderURL, "_self");
            } else if (alertExists === null) {
                const container = document.getElementById('container');
                const alertRow = document.createElement('div');
                const alert = document.createElement('div');
                const alertMessage = document.createElement('h3');
                alertRow.classList.add('row');
                alert.classList.add('col-12');
                alert.appendChild(alertMessage);
                alertRow.appendChild(alert);
                container.appendChild(alertRow);
                alertMessage.textContent = "You can't order emptiness !";
                alertMessage.setAttribute('id', 'alertMessage');
            };
        });
    };
};

// Fonctions adaptées aux pages :

// Lance la fonction d'initialisation du panier si possible, quelle que soit la page, pour permettre à un nouvel utilisateur arrivant sur l'une
// d'elles d'avoir un panier fonctionnel
cartInitialisation();

// Lancée sur la page index (vue de la liste des produits en vente)
// Récupération de la liste des produits en vente, création d'une row contenant leurs infos sur la page pour chacun d'entre eux,
// et insère en paramètre leur id dans l'URL renvoyant vers leur page produit
async function getProductList() {
    try {
        // Récupère la liste des produits en vente par une requête serveur
        const productList = await requestProductList();
        // Pour chaque produit en vente, crée une row contenant son nom avec un lien vers sa page produit, sa description, son prix et son image
        for (let i = 0; i < productList.length; ++i) {
            const newProduct = document.createElement("div");
            newProduct.classList.add("row");
            // Crée la colonne "nom + lien vers page produit"
            const productName = document.createElement("div");
            const linkName = document.createElement("a");
            const linkNameTextContent = document.createElement("h3");
            productName.classList.add("col-3");
            linkNameTextContent.textContent = productList[i].name;
            linkName.setAttribute("href", "./public/pages/produit.html" + "?id=" + productList[i]._id);
            linkName.appendChild(linkNameTextContent);
            productName.appendChild(linkName);
            newProduct.appendChild(productName);
            // Crée la colonne description
            const productDescription = document.createElement("div");
            productDescription.classList.add("col-3");
            const productDescriptionText = document.createElement("p");
            productDescriptionText.textContent = productList[i].description;
            productDescription.appendChild(productDescriptionText);
            newProduct.appendChild(productDescription);
            // Crée la colonne prix
            const productPrice = document.createElement("div");
            productPrice.classList.add("col-3", "col-md-2");
            const productPriceText = document.createElement("p");
            productPriceText.textContent = productList[i].price + "€";
            productPrice.appendChild(productPriceText);
            newProduct.appendChild(productPrice);
            // Crée la colonne image
            const productImage = document.createElement("div");
            productImage.classList.add("col-6", "col-md-4");
            const imageContent = document.createElement("img");
            imageContent.setAttribute("src", productList[i].imageUrl);
            imageContent.setAttribute("alt", "Teddy Bear");
            imageContent.classList.add("thumbnail", "rounded", "mx-auto", "d-block");
            productImage.appendChild(imageContent);
            newProduct.appendChild(productImage);

            merchList.appendChild(newProduct);
        }
    } catch (error) {
        const errorSpace = document.createElement("div");
        errorSpace.classList.add("row");
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("col");
        errorMessage.textContent = "Unable to get product list";
        errorSpace.appendChild(errorMessage);
        merchList.appendChild(errorSpace);
    };
};

// Lancée sur la page produit
// Fonction permettant à la page produit de récupérer les infos du produit choisi par une requête serveur utilisant l'id contenu dans
// les paramètres de l'URL, pour les afficher dans la page
async function getProductDetails() {
    try {
        let currentURL = new URL(window.location.href);
        let id = currentURL.searchParams.get('id');
        const productDetails = await requestProductDetails(id);
        // Récupère les zones à remplir sur la page
        const imageHolder = document.getElementById('productImage');
        const nameHolder = document.getElementById('name');
        const priceHolder = document.getElementById('price');
        const descriptionHolder = document.getElementById('description');
        const colorChoice = document.getElementById('color');
        // Remplit les zones d'image, de nom, de prix, et de description
        imageHolder.setAttribute('src', productDetails.imageUrl);
        imageHolder.classList.add('productImage');
        nameHolder.textContent = productDetails.name;
        priceHolder.textContent = "Price : " + productDetails.price + "€";
        descriptionHolder.textContent = productDetails.description;
        // Ajoute le choix des options de personnalisation
        for (let i = 0; i < productDetails.colors.length; ++i) {
            const newOption = document.createElement('option');
            newOption.setAttribute('value', productDetails.colors[i]);
            newOption.textContent = productDetails.colors[i];
            colorChoice.appendChild(newOption);
        };
        checkDoesArticleFormExist();
    } catch (error) {
        const descriptionHolder = document.getElementById('description');
        descriptionHolder.textContent = "Unable to get product details";
    };
};

// Lancée au chargement de la page panier, permet de traduire la variable permanente cartPerma en produits visibles sur la page et leur associer 
// le nombre qu'il y en a dans le panier et leurs infos
async function getCartDetails() {
    try {
        // Récupère la liste des produits en vente et leurs infos
        const productList = await requestProductList();
        // Récupère la variable de session cartPerma et transfère son contenu dans l'array temporaire cartTempo
        let cartTempo = getCartPerma();
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
                linkName.setAttribute("href", "./produit.html" + "?id=" + productList[i]._id);
                linkName.appendChild(linkNameTextContent);
                productName.appendChild(linkName);
                newProduct.appendChild(productName);

                // Crée la colonne prix du produit concerné
                const productPrice = document.createElement("div");
                productPrice.classList.add("col-3");
                const productPriceText = document.createElement("p");
                productPriceText.textContent = productList[i].price + "€";
                productPrice.appendChild(productPriceText);
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
                            cartTempo[a].count = parseInt(productCountInput.value);
                            setCartperma(cartTempo);
                            totalPriceCalc();
                            totalPriceText.textContent = totalPrice + "€";
                        };
                    };
                });

                // Crée le bouton de suppression du type d'article du panier
                const removeArticle = document.createElement("div");
                removeArticle.classList.add("col-3");
                removeArticle.setAttribute("id", "remove");
                const removeButton = document.createElement("button");
                removeArticle.appendChild(removeButton);
                removeButton.setAttribute("type", "button");
                removeButton.textContent = "Remove";
                removeButton.addEventListener("click", function(event) {
                    event.stopPropagation();
                    // Récupération de l'id du produit actuel en variable à tester
                    let idToTest = productList[i]._id;
                    // Comparaison entre l'id du produit de la row et ceux de tous les produits en vente jusqu'à trouver le même, puis retire tous les articles de ce type du panier
                    for (let a = 0; a < cartTempo.length; a++) {
                        if (idToTest === cartTempo[a].id) {
                            cartTempo[a].count = 0;
                            // Retransfère l'array temporaire dans l'array permanent
                            setCartperma(cartTempo);
                        }
                    }
                    // Retire la row de la page
                    cartList.removeChild(newProduct);
                    totalPriceCalc();
                    totalPriceText.textContent = totalPrice + "€";
                });
                newProduct.appendChild(removeArticle);
                // Ajoute la row à la page
                cartList.appendChild(newProduct);
            }
        };
        // Affiche le prix final sur la page
        totalPriceCalc();
        totalPriceText.textContent = totalPrice + "€";
        // Ajoute un écouteur d'événement sur le bouton qui vide le panier et recharge la page
        const emptyButton = document.getElementById("emptyButton");
        emptyButton.addEventListener("click", function(event) {
            event.stopPropagation();
            // Enlève la sécurité de la fonction d'initialisation du panier et appelle celle-ci pour reset le panier
            localStorage.setItem('initialised', 'false');
            cartInitialisation();
            document.location.reload();
        });
        checkDoesOrderFormExist();
    } catch (errorResponse) {
        totalPriceText.textContent = "Unable to load cart"
    };
};



// Lancée sur la page de confirmation de commande
// Fonction asynchrone demandant l'envoi d'une requête POST contenant les informations de commande (contact et id des items) au serveur, puis
// récupère la réponse de confirmation de commande et affiche le prix de la commande et l'id de commande, puis demande la réinitialisation du panier
async function postOrder() {
    try {
        // Récupère le prix du panier
        let totalPrice = totalPriceCalc();
        // Teste si le prix du panier est > 0 (=/= un rechargement de la page de confirmation), si oui, le code s'exécute
        // normalement, sinon il redirige vers la page d'accueil
        if (totalPrice > 0) {
            // Récupère les infos contact contenues dans les paramètres de l'URL
            let currentURL = new URL(window.location.href);
            let firstName = currentURL.searchParams.get('firstName');
            let lastName = currentURL.searchParams.get('lastName');
            let address = currentURL.searchParams.get('address');
            let city = currentURL.searchParams.get('city');
            let email = currentURL.searchParams.get('email');
            // Crée un objet contact qui sera envoyé au serveur avec la requête
            let contact = {
                firstName: firstName,
                lastName: lastName,
                address: address,
                city: city,
                email: email
            };
            // Récupère l'id des types d'objets présents dans le panier et les stocke dans un tableau qui sera envoyé au serveur avec la requête
            let cartTempo = getCartPerma();
            let idList = [];
            for (i = 0; i < cartTempo.length; i++) {
                if (cartTempo[i].count > 0) {
                    idList.push(cartTempo[i].id);
                }
            };
            // Crée l'objet qui sera envoyé au serveur avec la requête et qui contient l'objet contact + le tableau de liste d'id du panier
            let data = {
                contact: contact,
                products: idList
            };
            // Envoie la requête et attend la réponse
            const orderConfirmation = await requestOrderConfirmation(data);
            // Utilise la réponse du serveur et le prix du panier pour annoncer à l'utilisateur que sa commande a été validée avec
            // un id de confirmation de commande, et que sa commande lui a coûté tant
            const priceAnnounce = document.getElementById('priceAnnounce');
            const orderIdAnnounce = document.getElementById('orderIdAnnounce');
            priceAnnounce.textContent = "You have ordered for " + totalPrice + "€ in goods.";
            orderIdAnnounce.textContent = "Your order id is " + orderConfirmation.orderId + ". Keep it preciously !" ;
            // Enlève la sécurité de la fonction d'initialisation du panier et appelle celle-ci pour reset le panier
            localStorage.setItem('initialised', 'false');
            cartInitialisation();
        } else {
            window.location.replace("../../index.html");
        }
    } catch (error) {
        const priceAnnounce = document.getElementById('priceAnnounce');
        priceAnnounce.textContent = "Something went wrong with your order, please try again later."
    };
};