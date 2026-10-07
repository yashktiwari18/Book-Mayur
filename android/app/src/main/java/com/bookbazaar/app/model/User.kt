package com.bookbazaar.app.model

data class User(
    val id: String = "demo_user",
    val firstName: String = "Book Bazaar",
    val fullName: String = "Demo Reader",
    val email: String = "reader@bookbazaar.in",
    val isSignedIn: Boolean = true
)
