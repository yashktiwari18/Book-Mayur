package com.bookbazaar.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bookbazaar.app.ui.components.BrandLogo
import com.bookbazaar.app.ui.components.FeaturedOfferBanner
import com.bookbazaar.app.ui.theme.DmSansFontFamily
import com.bookbazaar.app.ui.theme.PaperBackground
import com.bookbazaar.app.ui.theme.PlayfairDisplayFontFamily

@Composable
fun LandingScreen(
    viewModel: com.bookbazaar.app.viewmodel.BookBazaarViewModel,
    onNavigateToSignIn: () -> Unit,
    onNavigateToShop: () -> Unit
) {
    val promotions by viewModel.promotions.collectAsState()
    var activePromoIndex by remember { mutableIntStateOf(0) }
    val activePromo = promotions.getOrNull(activePromoIndex) ?: promotions.firstOrNull()
    var selectedTab by remember { mutableIntStateOf(0) } // 0 = By class, 1 = By subject

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PaperBackground)
            .statusBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(bottom = 32.dp)
    ) {
        // Mobile App Header (.mobile-app-header)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            BrandLogo(compact = true)

            // Delivery Details (.mobile-delivery)
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .clickable { onNavigateToShop() }
                    .padding(horizontal = 6.dp, vertical = 4.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.LocationOn,
                    contentDescription = null,
                    tint = Color(0xFF326248),
                    modifier = Modifier.size(16.dp)
                )
                Column {
                    Text(
                        text = "BOOKS FOR",
                        fontFamily = DmSansFontFamily,
                        fontSize = 7.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF8A9388),
                        letterSpacing = 0.8.sp
                    )
                    Text(
                        text = "Classes 1—12",
                        fontFamily = DmSansFontFamily,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2B4838)
                    )
                }
                Icon(
                    imageVector = Icons.Default.KeyboardArrowDown,
                    contentDescription = null,
                    tint = Color(0xFF326248),
                    modifier = Modifier.size(14.dp)
                )
            }

            // User / Account circle (.mobile-account-link)
            Box(
                modifier = Modifier
                    .size(37.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFFFFDF7))
                    .border(1.dp, Color(0xFFE5E0D4), CircleShape)
                    .clickable { onNavigateToSignIn() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = "Sign in",
                    tint = Color(0xFF355C45),
                    modifier = Modifier.size(18.dp)
                )
            }
        }

        // Browse Tabs: "By class" / "By subject" (.mobile-home-tabs)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Column(
                modifier = Modifier
                    .clickable { selectedTab = 0 }
                    .padding(bottom = 6.dp)
            ) {
                Text(
                    text = "By class",
                    fontFamily = DmSansFontFamily,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (selectedTab == 0) Color(0xFF2D503D) else Color(0xFF92988F)
                )
                Spacer(modifier = Modifier.height(4.dp))
                if (selectedTab == 0) {
                    Box(
                        modifier = Modifier
                            .width(46.dp)
                            .height(3.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(Color(0xFF4A8A5D))
                    )
                }
            }

            Column(
                modifier = Modifier
                    .clickable {
                        selectedTab = 1
                        onNavigateToShop()
                    }
                    .padding(bottom = 6.dp)
            ) {
                Text(
                    text = "By subject",
                    fontFamily = DmSansFontFamily,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = if (selectedTab == 1) Color(0xFF2D503D) else Color(0xFF92988F)
                )
                Spacer(modifier = Modifier.height(4.dp))
                if (selectedTab == 1) {
                    Box(
                        modifier = Modifier
                            .width(58.dp)
                            .height(3.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(Color(0xFF4A8A5D))
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Featured Offer Card with Carousel Dots (.mobile-featured-offer)
        if (activePromo != null) {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                FeaturedOfferBanner(
                    promo = activePromo,
                    onExplore = onNavigateToShop
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Carousel Dots (.mobile-offer-dots)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    promotions.indices.forEach { index ->
                        Box(
                            modifier = Modifier
                                .padding(horizontal = 4.dp)
                                .size(if (index == activePromoIndex) 16.dp else 7.dp, 7.dp)
                                .clip(CircleShape)
                                .background(if (index == activePromoIndex) Color(0xFF607A61) else Color(0xFFC9D0C8))
                                .clickable { activePromoIndex = index }
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Browse Subjects Section (.mobile-subject-list)
        Column(modifier = Modifier.padding(horizontal = 16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "THE RIGHT SUBJECT",
                        fontFamily = DmSansFontFamily,
                        fontSize = 7.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF8C9688),
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "Browse subjects",
                        fontFamily = DmSansFontFamily,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF293F32)
                    )
                }
                Box(
                    modifier = Modifier
                        .size(31.dp)
                        .clip(CircleShape)
                        .border(1.dp, Color(0xFFE1E5DC), CircleShape)
                        .clickable { onNavigateToShop() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Browse subjects",
                        tint = Color(0xFF477552),
                        modifier = Modifier.size(15.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Subject rail (.mobile-subject-rail)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(11.dp)
            ) {
                viewModel.subjectFilters.forEachIndexed { index, subject ->
                    val (iconBg, iconTint) = when (index % 3) {
                        0 -> Color(0xFFEDF2E8) to Color(0xFF39704F)
                        1 -> Color(0xFFF4EFE0) to Color(0xFFA27637)
                        else -> Color(0xFFF4EAE4) to Color(0xFFAE5E47)
                    }

                    Column(
                        modifier = Modifier
                            .width(81.dp)
                            .clickable {
                                viewModel.setShopSubjectFilter(subject.name)
                                onNavigateToShop()
                            },
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(RoundedCornerShape(19.dp))
                                .background(iconBg)
                                .border(1.dp, Color(0xFFE5EADF), RoundedCornerShape(19.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.AutoStories,
                                contentDescription = null,
                                tint = iconTint,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = subject.name,
                            fontFamily = DmSansFontFamily,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF31493A),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = "${subject.bookCount} ${if (subject.bookCount == 1) "title" else "titles"}",
                            fontFamily = DmSansFontFamily,
                            fontSize = 8.sp,
                            color = Color(0xFF92998D)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(22.dp))

        // Shop by Class Section (.mobile-class-list)
        Column(modifier = Modifier.padding(horizontal = 16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "SCHOOL BOOKS, SORTED",
                        fontFamily = DmSansFontFamily,
                        fontSize = 7.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF8C9688),
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "Shop by class",
                        fontFamily = DmSansFontFamily,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF293F32)
                    )
                }
                Text(
                    text = "${viewModel.catalogSummary.bookCount} books",
                    fontFamily = DmSansFontFamily,
                    fontSize = 9.sp,
                    color = Color(0xFF879184)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Class rail (.mobile-class-rail)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(11.dp)
            ) {
                viewModel.classFilters.forEachIndexed { index, grade ->
                    val cardGradient = when (index % 3) {
                        0 -> Brush.verticalGradient(listOf(Color(0xFFFFFDF9), Color(0xFFEDF2E9)))
                        1 -> Brush.verticalGradient(listOf(Color(0xFFFFFDF8), Color(0xFFF3EFDF)))
                        else -> Brush.verticalGradient(listOf(Color(0xFFFFFDF8), Color(0xFFF3EAE4)))
                    }

                    Column(
                        modifier = Modifier
                            .width(91.dp)
                            .height(113.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(cardGradient)
                            .border(1.dp, Color(0xFFE5E8DE), RoundedCornerShape(14.dp))
                            .clickable {
                                viewModel.setShopClassFilter(grade.level)
                                onNavigateToShop()
                            }
                            .padding(11.dp),
                        verticalArrangement = Arrangement.SpaceBetween,
                        horizontalAlignment = Alignment.Start
                    ) {
                        Text(
                            text = "CLASS",
                            fontFamily = DmSansFontFamily,
                            fontSize = 7.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF8A9688),
                            letterSpacing = 0.8.sp
                        )
                        Text(
                            text = String.format("%02d", grade.level),
                            fontFamily = PlayfairDisplayFontFamily,
                            fontSize = 30.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF2D533D)
                        )
                        Text(
                            text = "${grade.bookCount} ${if (grade.bookCount == 1) "book" else "books"}",
                            fontFamily = DmSansFontFamily,
                            fontSize = 8.sp,
                            color = Color(0xFF899386)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Build your school list callout card (.mobile-start-card)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(Color(0xFFF0F2E9))
                .border(1.dp, Color(0xFFE4E8DE), RoundedCornerShape(14.dp))
                .clickable { onNavigateToShop() }
                .padding(13.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(37.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFFDCE8D8)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = Color(0xFF365942),
                    modifier = Modifier.size(19.dp)
                )
            }
            Spacer(modifier = Modifier.width(11.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Build your school list",
                    fontFamily = DmSansFontFamily,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF365942)
                )
                Text(
                    text = "Good books, all in one place",
                    fontFamily = DmSansFontFamily,
                    fontSize = 8.sp,
                    color = Color(0xFF849083)
                )
            }
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                tint = Color(0xFF365942),
                modifier = Modifier.size(17.dp)
            )
        }
    }
}
