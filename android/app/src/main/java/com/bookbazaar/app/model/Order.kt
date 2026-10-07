package com.bookbazaar.app.model

data class OrderItem(
    val orderId: String? = null,
    val bookId: String,
    val title: String,
    val imageUrl: String,
    val unitPrice: Int,
    val quantity: Int,
    val lineTotal: Int
)

data class Order(
    val id: String,
    val userId: String,
    val status: String, // 'placed', 'processing', 'shipped', 'delivered'
    val paymentMethod: String,
    val itemCount: Int,
    val total: Int,
    val customerName: String,
    val phone: String,
    val addressLine: String,
    val city: String,
    val state: String,
    val postalCode: String,
    val createdAt: String,
    val items: List<OrderItem>
)
