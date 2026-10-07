package com.bookbazaar.app.model

data class Promotion(
    val id: String,
    val eyebrow: String,
    val title: String,
    val subtitle: String,
    val discount: Int,
    val imageUrl: String,
    val background: String,
    val sortOrder: Int
)
