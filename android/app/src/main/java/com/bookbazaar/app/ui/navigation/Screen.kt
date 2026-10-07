package com.bookbazaar.app.ui.navigation

sealed class Screen(val route: String) {
    object Landing : Screen("landing")
    object Shop : Screen("shop")
    object Search : Screen("search")
    object Cart : Screen("cart")
    object Orders : Screen("orders")
    object OrderDetail : Screen("order_detail/{orderId}") {
        fun createRoute(orderId: String) = "order_detail/$orderId"
    }
    object Profile : Screen("profile")
    object SignIn : Screen("sign_in")
    object SignUp : Screen("sign_up")
}
