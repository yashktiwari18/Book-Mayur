package com.bookbazaar.app.model

data class Book(
    val id: String,
    val title: String,
    val author: String,
    val subject: String,
    val classLevel: Int,
    val price: Int,
    val originalPrice: Int,
    val imageUrl: String,
    val description: String,
    val rating: Double,
    val inStock: Boolean,
    val badge: String? = null
)
