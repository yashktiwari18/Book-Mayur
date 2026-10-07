package com.bookbazaar.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Assignment
import androidx.compose.material.icons.automirrored.outlined.Assignment
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bookbazaar.app.ui.theme.BottomNavBg
import com.bookbazaar.app.ui.theme.BottomNavBorder
import com.bookbazaar.app.ui.theme.BottomNavSelected
import com.bookbazaar.app.ui.theme.BottomNavUnselected
import com.bookbazaar.app.ui.theme.DmSansFontFamily
import com.bookbazaar.app.ui.theme.TerracottaBadge

sealed class BottomNavRoute(
    val route: String,
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    object Home : BottomNavRoute("shop", "Home", Icons.Filled.Home, Icons.Outlined.Home)
    object Search : BottomNavRoute("search", "Search", Icons.Filled.Search, Icons.Outlined.Search)
    object Cart : BottomNavRoute("cart", "Cart", Icons.Filled.ShoppingCart, Icons.Outlined.ShoppingCart)
    object Orders : BottomNavRoute("orders", "Orders", Icons.AutoMirrored.Filled.Assignment, Icons.AutoMirrored.Outlined.Assignment)
    object Profile : BottomNavRoute("profile", "Profile", Icons.Filled.Person, Icons.Outlined.Person)
}

val bottomNavItems = listOf(
    BottomNavRoute.Home,
    BottomNavRoute.Search,
    BottomNavRoute.Cart,
    BottomNavRoute.Orders,
    BottomNavRoute.Profile
)

@Composable
fun BottomNavBar(
    currentRoute: String,
    cartCount: Int,
    onNavigate: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(BottomNavBg)
            .border(width = 1.dp, color = BottomNavBorder)
            .navigationBarsPadding()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 7.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            bottomNavItems.forEach { item ->
                val isSelected = currentRoute == item.route || (item.route == "shop" && currentRoute == "landing")
                val activeColor = BottomNavSelected
                val inactiveColor = BottomNavUnselected

                Column(
                    modifier = Modifier
                        .clickable { onNavigate(item.route) }
                        .padding(horizontal = 8.dp, vertical = 2.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Box(
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isSelected) item.selectedIcon else item.unselectedIcon,
                            contentDescription = item.label,
                            tint = if (isSelected) activeColor else inactiveColor,
                            modifier = Modifier.size(23.dp)
                        )

                        if (item is BottomNavRoute.Cart && cartCount > 0) {
                            Box(
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .size(16.dp)
                                    .clip(CircleShape)
                                    .background(TerracottaBadge)
                                    .border(1.5.dp, BottomNavBg, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = if (cartCount > 99) "99+" else cartCount.toString(),
                                    color = Color.White,
                                    fontSize = 8.sp,
                                    fontFamily = DmSansFontFamily,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(3.dp))

                    Text(
                        text = item.label,
                        color = if (isSelected) activeColor else inactiveColor,
                        fontFamily = DmSansFontFamily,
                        fontSize = 9.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.SemiBold
                    )
                }
            }
        }
    }
}
