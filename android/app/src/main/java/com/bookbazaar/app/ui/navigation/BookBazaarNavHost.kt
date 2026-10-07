package com.bookbazaar.app.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.bookbazaar.app.ui.components.AppHeader
import com.bookbazaar.app.ui.components.BottomNavBar
import com.bookbazaar.app.ui.screens.CartScreen
import com.bookbazaar.app.ui.screens.LandingScreen
import com.bookbazaar.app.ui.screens.OrderDetailScreen
import com.bookbazaar.app.ui.screens.OrdersScreen
import com.bookbazaar.app.ui.screens.ProfileScreen
import com.bookbazaar.app.ui.screens.SearchScreen
import com.bookbazaar.app.ui.screens.ShopScreen
import com.bookbazaar.app.ui.screens.SignInScreen
import com.bookbazaar.app.ui.screens.SignUpScreen
import com.bookbazaar.app.ui.theme.PaperBackground
import com.bookbazaar.app.viewmodel.BookBazaarViewModel

@Composable
fun BookBazaarApp(
    viewModel: BookBazaarViewModel,
    navController: NavHostController = rememberNavController()
) {
    val user by viewModel.user.collectAsState()
    val cart by viewModel.cart.collectAsState()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Shop.route

    val isAuthScreen = currentRoute == Screen.SignIn.route || currentRoute == Screen.SignUp.route
    val isLandingScreen = currentRoute == Screen.Landing.route

    val showHeader = !isAuthScreen && !isLandingScreen
    val showBottomNav = !isAuthScreen

    Scaffold(
        topBar = {
            if (showHeader) {
                AppHeader(
                    cartCount = cart.itemCount,
                    userInitial = user.firstName.take(1).ifBlank { "P" },
                    isSignedIn = user.isSignedIn,
                    onLogoClick = {
                        navController.navigate(Screen.Shop.route) {
                            popUpTo(Screen.Shop.route) { inclusive = true }
                        }
                    },
                    onCartClick = {
                        navController.navigate(Screen.Cart.route)
                    },
                    onProfileClick = {
                        navController.navigate(Screen.Profile.route)
                    }
                )
            }
        },
        bottomBar = {
            if (showBottomNav) {
                BottomNavBar(
                    currentRoute = currentRoute,
                    cartCount = cart.itemCount,
                    onNavigate = { route ->
                        navController.navigate(route) {
                            popUpTo(Screen.Shop.route) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        },
        containerColor = PaperBackground
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(PaperBackground)
        ) {
            NavHost(
                navController = navController,
                startDestination = if (user.isSignedIn) Screen.Shop.route else Screen.Landing.route
            ) {
                composable(Screen.Landing.route) {
                    LandingScreen(
                        viewModel = viewModel,
                        onNavigateToSignIn = { navController.navigate(Screen.SignIn.route) },
                        onNavigateToShop = { navController.navigate(Screen.Shop.route) }
                    )
                }

                composable(Screen.Shop.route) {
                    ShopScreen(
                        viewModel = viewModel,
                        onNavigateToSearch = { navController.navigate(Screen.Search.route) },
                        onNavigateToDeals = {
                            viewModel.searchDealOnly.value = true
                            navController.navigate(Screen.Search.route)
                        }
                    )
                }

                composable(Screen.Search.route) {
                    SearchScreen(viewModel = viewModel)
                }

                composable(Screen.Cart.route) {
                    CartScreen(
                        viewModel = viewModel,
                        onNavigateToShop = { navController.navigate(Screen.Shop.route) },
                        onNavigateToOrderDetail = { orderId ->
                            navController.navigate(Screen.OrderDetail.createRoute(orderId))
                        }
                    )
                }

                composable(Screen.Orders.route) {
                    OrdersScreen(
                        viewModel = viewModel,
                        onNavigateToDetail = { orderId ->
                            navController.navigate(Screen.OrderDetail.createRoute(orderId))
                        },
                        onNavigateToShop = { navController.navigate(Screen.Shop.route) }
                    )
                }

                composable(
                    route = Screen.OrderDetail.route,
                    arguments = listOf(navArgument("orderId") { type = NavType.StringType })
                ) { backStackEntry ->
                    val orderId = backStackEntry.arguments?.getString("orderId") ?: ""
                    OrderDetailScreen(
                        orderId = orderId,
                        viewModel = viewModel,
                        onBack = { navController.popBackStack() }
                    )
                }

                composable(Screen.Profile.route) {
                    ProfileScreen(
                        viewModel = viewModel,
                        onNavigateToOrders = { navController.navigate(Screen.Orders.route) },
                        onNavigateToCart = { navController.navigate(Screen.Cart.route) },
                        onSignOut = {
                            navController.navigate(Screen.Landing.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        }
                    )
                }

                composable(Screen.SignIn.route) {
                    SignInScreen(
                        viewModel = viewModel,
                        onSuccess = {
                            navController.navigate(Screen.Shop.route) {
                                popUpTo(Screen.Landing.route) { inclusive = true }
                            }
                        },
                        onNavigateToSignUp = { navController.navigate(Screen.SignUp.route) }
                    )
                }

                composable(Screen.SignUp.route) {
                    SignUpScreen(
                        viewModel = viewModel,
                        onSuccess = {
                            navController.navigate(Screen.Shop.route) {
                                popUpTo(Screen.Landing.route) { inclusive = true }
                            }
                        },
                        onNavigateToSignIn = { navController.navigate(Screen.SignIn.route) }
                    )
                }
            }
        }
    }
}
