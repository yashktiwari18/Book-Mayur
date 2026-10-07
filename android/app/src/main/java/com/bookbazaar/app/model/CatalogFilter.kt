package com.bookbazaar.app.model

data class ClassFilter(
    val level: Int,
    val label: String,
    val bookCount: Int
)

data class SubjectFilter(
    val name: String,
    val bookCount: Int
)

data class CatalogSummary(
    val bookCount: Int,
    val classCount: Int,
    val subjectCount: Int,
    val promotionCount: Int
)
