package com.bookbazaar.app.model

data class CartItem(
    val book: Book,
    val quantity: Int,
    val lineTotal: Int
)

data class Cart(
    val items: List<CartItem> = emptyList(),
    val itemCount: Int = 0,
    val subtotal: Int = 0
)
