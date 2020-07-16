const Product = require('../models/product');


exports.getProducts = (req, res, next) => {


    Product.findAll().then((products) => {

        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products',

        });
    }).catch(err => console.log(err));

};

exports.getProductFromProductId = (req, res, next) => {

    const productId = req.params.productId;

    Product.findByPk(productId)
        .then((product) => {

            // console.log(products);
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch(err => console.log(err));

}


exports.getIndex = (req, res, next) => {
    Product.findAll().then((products) => {

        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',

        });
    }).catch(err => console.log(err));

};

exports.getCart = (req, res, next) => {

    req.user.getCart().then((cart) => {
        return cart.getProducts()
            .then((products) => {
                res.render('shop/cart',
                    {
                        path: '/cart',
                        pageTitle: 'Your Cart',
                        products: products
                    });

            }).catch(err => console.log(err));
    }).catch(err => console.log(err));
}

exports.postCart = (req, res, next) => {

    const productId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart()
        .then((cart) => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } });
        })
        .then((products) => {
            let product;
            if (products.length > 0) {

                product = products[0];
            }
            if (product) {
                newQuantity += product.cartItem.quantity;
                return product;
            }
            return Product.findByPk(productId);
        })
        .then((product) => {
            return fetchedCart.addProduct(product, { through: { quantity: newQuantity } })
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err))

}

exports.postCartDeleteProduct = (req, res, next) => {

    const productId = req.body.productId;
    req.user.getCart()
        .then((cart) => {
            return cart.getProducts({ where: { id: productId } })
        }).then((products) => {
            const product = products[0];
            return product.cartItem.destroy();
        })
        .then((result) => {
            console.log('Product deleted from cart');
            res.redirect('/cart');
        })
        .catch(err => console.log(err));

}

exports.getCheckout = (req, res, next) => {

    res.render('shop/checkout',
        {
            path: '/checkout',
            pageTitle: 'Checkout'
        });

}

exports.getOrders = (req, res, next) => {
    req.user.getOrders({include : ['products']})
    .then((orders)=>{

        res.render('shop/orders',
            {
                path: '/orders',
                pageTitle: 'Orders',
                orders:orders
            });
    })
    .catch(err=>console.log(err));
}


exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.getCart().then((cart) => {
        fetchedCart = cart;
        return cart.getProducts();
    })
        .then((products) => {
            // console.log(products);
            return req.user.createOrder()
                .then((order) => {
                    return order.addProducts(products.map(product => {
                        product.orderItem = { quantity: product.cartItem.quantity }
                        return product;
                    }))
                })
                .catch(err => console.log(err));
        })
        .then((result) => {
            return fetchedCart.setProducts(null);

        })
        .then((result) => {
            ;
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
}