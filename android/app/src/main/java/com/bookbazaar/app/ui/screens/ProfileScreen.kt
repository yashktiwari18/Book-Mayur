package com.bookbazaar.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.Assignment
import androidx.compose.material.icons.automirrored.filled.HelpOutline
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bookbazaar.app.ui.components.PageHeading
import com.bookbazaar.app.ui.theme.BorderCard
import com.bookbazaar.app.ui.theme.CardSurfaceSubtle
import com.bookbazaar.app.ui.theme.CardWhite
import com.bookbazaar.app.ui.theme.DmSansFontFamily
import com.bookbazaar.app.ui.theme.ForestBrand
import com.bookbazaar.app.ui.theme.ForestTitle
import com.bookbazaar.app.ui.theme.PaperBackground
import com.bookbazaar.app.ui.theme.PlayfairDisplayFontFamily
import com.bookbazaar.app.ui.theme.StatusDeliveredBg
import com.bookbazaar.app.ui.theme.StatusDeliveredText
import com.bookbazaar.app.ui.theme.TerracottaAccent
import com.bookbazaar.app.ui.theme.TerracottaLightBg
import com.bookbazaar.app.ui.theme.TextMuted

@Composable
fun ProfileScreen(
    viewModel: com.bookbazaar.app.viewmodel.BookBazaarViewModel,
    onNavigateToOrders: () -> Unit,
    onNavigateToCart: () -> Unit,
    onSignOut: () -> Unit
) {
    val user by viewModel.user.collectAsState()
    val orders by viewModel.orders.collectAsState()
    val cart by viewModel.cart.collectAsState()
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PaperBackground)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
            .padding(bottom = 32.dp)
    ) {
        PageHeading(
            kicker = "ACCOUNT & SETTINGS",
            title = "Your profile.",
            text = "Manage your student profiles, addresses, and reading preferences."
        )

        Spacer(modifier = Modifier.height(10.dp))

        // User Summary Card (.user-card from Stitch screen_4_profile)
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(18.dp))
                .background(CardWhite)
                .border(1.dp, BorderCard, RoundedCornerShape(18.dp))
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Large initial avatar
                Box(
                    modifier = Modifier
                        .size(54.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFE3ECE6))
                        .border(1.dp, Color(0xFFC8DACF), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = (user.firstName.take(1).ifBlank { "B" }).uppercase(),
                        fontSize = 22.sp,
                        fontFamily = PlayfairDisplayFontFamily,
                        fontWeight = FontWeight.Bold,
                        color = ForestTitle
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = user.fullName.ifBlank { "Bhavya Sharma" },
                            fontSize = 16.sp,
                            fontFamily = DmSansFontFamily,
                            fontWeight = FontWeight.Bold,
                            color = ForestTitle
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(Color(0xFFE7F0EB))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "Parent",
                                fontFamily = DmSansFontFamily,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = ForestBrand
                            )
                        }
                    }
                    Text(
                        text = "+91 98765 43210",
                        fontFamily = DmSansFontFamily,
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                    Text(
                        text = user.email.ifBlank { "bhavya.sharma@example.com" },
                        fontFamily = DmSansFontFamily,
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                }

                // Edit button in terracotta
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .clickable { }
                        .padding(horizontal = 6.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Edit",
                        tint = TerracottaAccent,
                        modifier = Modifier.size(13.dp)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "Edit",
                        fontFamily = DmSansFontFamily,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TerracottaAccent
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
            Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(Color(0xFFF0EBDF)))
            Spacer(modifier = Modifier.height(10.dp))

            // Linked students row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "Linked students:",
                    fontFamily = DmSansFontFamily,
                    fontSize = 11.sp,
                    color = TextMuted
                )
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color(0xFFF5F1E8))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "• Aarav (Class 5)",
                        fontFamily = DmSansFontFamily,
                        fontSize = 11.sp,
                        color = ForestTitle,
                        fontWeight = FontWeight.Medium
                    )
                }
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color(0xFFF5F1E8))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "• Ananya (Class 2)",
                        fontFamily = DmSansFontFamily,
                        fontSize = 11.sp,
                        color = ForestTitle,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Student Profiles Section from Stitch
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "STUDENT PROFILES (2)",
                fontFamily = DmSansFontFamily,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = ForestBrand,
                letterSpacing = 1.sp
            )
            Text(
                text = "+ Add Student",
                fontFamily = DmSansFontFamily,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = ForestBrand
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Student Profile Card 1 (Aarav)
        StudentProfileCard(
            initials = "AS",
            name = "Aarav Sharma",
            gradeDetail = "Class 5 • Section B • Roll #14",
            school = "Delhi Public School, R.K. Puram",
            booklistAction = "View CBSE Class 5 Booklist",
            bookCountLabel = "14 books assigned"
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Student Profile Card 2 (Ananya)
        StudentProfileCard(
            initials = "AS",
            name = "Ananya Sharma",
            gradeDetail = "Class 2 • Section A • Roll #07",
            school = "Delhi Public School, R.K. Puram",
            booklistAction = "View Primary Class 2 Booklist",
            bookCountLabel = "8 books assigned",
            isTerracottaInitials = true
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Orders & Payments Section from Stitch
        Text(
            text = "ORDERS & PAYMENTS",
            fontFamily = DmSansFontFamily,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = ForestBrand,
            letterSpacing = 1.sp
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Wallet & Credits Card
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(CardWhite)
                .border(1.dp, BorderCard, RoundedCornerShape(16.dp))
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFFF9EDE8)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.AccountBalanceWallet,
                    contentDescription = null,
                    tint = TerracottaAccent,
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "BookBazaar Wallet & Credits",
                    fontFamily = DmSansFontFamily,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = ForestTitle
                )
                Text(
                    text = "Available cashbacks and gift cards",
                    fontFamily = DmSansFontFamily,
                    fontSize = 11.sp,
                    color = TextMuted
                )
            }
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFFE5EDE7))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "₹250",
                    fontFamily = DmSansFontFamily,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = ForestBrand
                )
            }
            Spacer(modifier = Modifier.width(6.dp))
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = TextMuted,
                modifier = Modifier.size(18.dp)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Action rows container (Orders, Cart, Sign Out)
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(18.dp))
                .background(CardWhite)
                .border(1.dp, BorderCard, RoundedCornerShape(18.dp))
        ) {
            ProfileActionRow(
                icon = Icons.AutoMirrored.Filled.Assignment,
                title = "Your orders",
                subtitle = "${orders.size} orders placed",
                onClick = onNavigateToOrders
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(BorderCard)
            )

            ProfileActionRow(
                icon = Icons.Default.ShoppingBag,
                title = "Your basket",
                subtitle = if (cart.itemCount > 0) "${cart.itemCount} items ready for checkout" else "Pick up where you left off",
                onClick = onNavigateToCart
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(BorderCard)
            )

            ProfileActionRow(
                icon = Icons.AutoMirrored.Filled.Logout,
                title = "Sign out",
                subtitle = "See you again soon",
                isDestructive = true,
                onClick = {
                    viewModel.signOut()
                    onSignOut()
                }
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Support / Help card
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(CardWhite)
                .border(1.dp, BorderCard, RoundedCornerShape(16.dp))
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.HelpOutline,
                contentDescription = null,
                tint = ForestBrand,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Need a hand?",
                    fontFamily = DmSansFontFamily,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = ForestTitle
                )
                Text(
                    text = "We’re happy to help with your order or book list.",
                    fontFamily = DmSansFontFamily,
                    fontSize = 11.sp,
                    color = TextMuted
                )
            }
            Text(
                text = "Get in touch →",
                fontFamily = DmSansFontFamily,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = ForestBrand,
                modifier = Modifier.clickable {
                    val intent = Intent(Intent.ACTION_SENDTO).apply {
                        data = Uri.parse("mailto:hello@bookbazaar.in")
                    }
                    try {
                        context.startActivity(intent)
                    } catch (e: Exception) {
                        // ignore if no mail client
                    }
                }
            )
        }
    }
}

@Composable
fun StudentProfileCard(
    initials: String,
    name: String,
    gradeDetail: String,
    school: String,
    booklistAction: String,
    bookCountLabel: String,
    isTerracottaInitials: Boolean = false
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(CardWhite)
            .border(1.dp, BorderCard, RoundedCornerShape(16.dp))
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(if (isTerracottaInitials) Color(0xFFF7ECE6) else Color(0xFFE2EBE5)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = initials,
                    fontFamily = DmSansFontFamily,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isTerracottaInitials) TerracottaAccent else ForestBrand
                )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = name,
                        fontFamily = DmSansFontFamily,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = ForestTitle
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(Color(0xFFE7F0EB))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "Active",
                            fontFamily = DmSansFontFamily,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = ForestBrand
                        )
                    }
                }
                Text(
                    text = gradeDetail,
                    fontFamily = DmSansFontFamily,
                    fontSize = 11.sp,
                    color = TextMuted
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // School affiliation box
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(Color(0xFFF9F6EE))
                .padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.School,
                    contentDescription = null,
                    tint = Color(0xFFB57E3E),
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = school,
                    fontFamily = DmSansFontFamily,
                    fontSize = 11.sp,
                    color = ForestTitle
                )
            }
            Text(
                text = "Synced",
                fontFamily = DmSansFontFamily,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = ForestBrand
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Booklist footer
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = booklistAction,
                    fontFamily = DmSansFontFamily,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = TerracottaAccent
                )
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    tint = TerracottaAccent,
                    modifier = Modifier.size(12.dp)
                )
            }
            Text(
                text = bookCountLabel,
                fontFamily = DmSansFontFamily,
                fontSize = 10.sp,
                color = TextMuted
            )
        }
    }
}

@Composable
fun ProfileActionRow(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit,
    isDestructive: Boolean = false
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(CircleShape)
                .background(if (isDestructive) TerracottaLightBg else CardSurfaceSubtle),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = if (isDestructive) TerracottaAccent else ForestBrand,
                modifier = Modifier.size(18.dp)
            )
        }

        Spacer(modifier = Modifier.width(14.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                fontFamily = DmSansFontFamily,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = if (isDestructive) TerracottaAccent else ForestTitle
            )
            Text(
                text = subtitle,
                fontFamily = DmSansFontFamily,
                fontSize = 11.sp,
                color = TextMuted
            )
        }

        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = null,
            tint = TextMuted,
            modifier = Modifier.size(18.dp)
        )
    }
}
