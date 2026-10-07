package com.bookbazaar.app.ui.screens

import androidx.compose.foundation.Image
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bookbazaar.app.R
import com.bookbazaar.app.ui.components.BookCard
import com.bookbazaar.app.ui.components.EmptyState
import com.bookbazaar.app.ui.components.PromotionCard
import com.bookbazaar.app.ui.components.SubjectBundlesSection
import com.bookbazaar.app.ui.theme.BorderCard
import com.bookbazaar.app.ui.theme.CardWhite
import com.bookbazaar.app.ui.theme.DmSansFontFamily
import com.bookbazaar.app.ui.theme.ForestBrand
import com.bookbazaar.app.ui.theme.ForestTitle
import com.bookbazaar.app.ui.theme.GoldSand
import com.bookbazaar.app.ui.theme.PaperBackground
import com.bookbazaar.app.ui.theme.PlayfairDisplayFontFamily
import com.bookbazaar.app.ui.theme.TextMuted
import com.bookbazaar.app.viewmodel.BookBazaarViewModel

@Composable
fun ShopScreen(
    viewModel: BookBazaarViewModel,
    onNavigateToSearch: () -> Unit,
    onNavigateToDeals: () -> Unit
) {
    val user by viewModel.user.collectAsState()
    val books by viewModel.shopBooks.collectAsState()
    val promotions by viewModel.promotions.collectAsState()
    val savedIds by viewModel.savedBookIds.collectAsState()
    val selectedClass by viewModel.selectedShopClass.collectAsState()
    val selectedSubject by viewModel.selectedShopSubject.collectAsState()
    val addingBookId by viewModel.addingBookId.collectAsState()
    val addedBookId by viewModel.addedBookId.collectAsState()
    val addingBundleKey by viewModel.addingBundleKey.collectAsState()

    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = Modifier
            .fillMaxSize()
            .background(PaperBackground),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Welcome line
        item(span = { GridItemSpan(2) }) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "GOOD MORNING, ${(user.firstName.ifBlank { "FAMILY" }).uppercase()}",
                    fontFamily = DmSansFontFamily,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = ForestBrand,
                    letterSpacing = 1.sp
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = null,
                        tint = ForestBrand,
                        modifier = Modifier.size(13.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "A better school year starts here",
                        fontFamily = DmSansFontFamily,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextMuted
                    )
                }
            }
        }

        // Editorial Hero Banner
        item(span = { GridItemSpan(2) }) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(ForestBrand)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.books_editorial),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.matchParentSize(),
                    alpha = 0.22f
                )

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                ) {
                    Text(
                        text = "READY WHEN THE BELL RINGS",
                        fontFamily = DmSansFontFamily,
                        color = GoldSand,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.2.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Let’s get your\nschool list sorted.",
                        color = Color.White,
                        fontSize = 24.sp,
                        fontFamily = PlayfairDisplayFontFamily,
                        fontWeight = FontWeight.Bold,
                        lineHeight = 30.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Books, bundles and the little details that make a big school year.",
                        fontFamily = DmSansFontFamily,
                        color = Color.White.copy(alpha = 0.85f),
                        fontSize = 12.sp,
                        lineHeight = 17.sp
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(PaperBackground)
                            .clickable { onNavigateToSearch() }
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Browse all books",
                            fontFamily = DmSansFontFamily,
                            color = ForestBrand,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = null,
                            tint = ForestBrand,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }
        }

        // Promotions Carousel
        item(span = { GridItemSpan(2) }) {
            Column(modifier = Modifier.padding(top = 10.dp)) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    Column {
                        Text(
                            text = "A GOOD DEAL ON A GREAT START",
                            fontFamily = DmSansFontFamily,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = ForestBrand,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "Offers for your book list",
                            fontSize = 20.sp,
                            fontFamily = PlayfairDisplayFontFamily,
                            fontWeight = FontWeight.Bold,
                            color = ForestTitle
                        )
                    }
                    Text(
                        text = "SWIPE TO EXPLORE →",
                        fontFamily = DmSansFontFamily,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextMuted,
                        letterSpacing = 0.5.sp
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    promotions.forEachIndexed { index, promo ->
                        PromotionCard(
                            promo = promo,
                            index = index,
                            onClick = onNavigateToDeals
                        )
                    }
                }
            }
        }

        // Shop by class scroller
        item(span = { GridItemSpan(2) }) {
            Column(modifier = Modifier.padding(top = 8.dp)) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    Column {
                        Text(
                            text = "PICK UP WHERE YOU ARE",
                            fontFamily = DmSansFontFamily,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = ForestBrand,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "Shop by class",
                            fontSize = 20.sp,
                            fontFamily = PlayfairDisplayFontFamily,
                            fontWeight = FontWeight.Bold,
                            color = ForestTitle
                        )
                    }
                    Text(
                        text = "${viewModel.catalogSummary.classCount} grades",
                        fontFamily = DmSansFontFamily,
                        fontSize = 11.sp,
                        color = TextMuted
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // ALL Classes tile
                    val isAllSelected = selectedClass == null
                    Column(
                        modifier = Modifier
                            .width(86.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(if (isAllSelected) ForestBrand else CardWhite)
                            .border(1.dp, if (isAllSelected) ForestBrand else BorderCard, RoundedCornerShape(14.dp))
                            .clickable { viewModel.setShopClassFilter(null) }
                            .padding(10.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "ALL",
                            fontFamily = DmSansFontFamily,
                            color = if (isAllSelected) GoldSand else ForestBrand,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "Classes",
                            fontFamily = DmSansFontFamily,
                            color = if (isAllSelected) Color.White else ForestTitle,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "All books",
                            fontFamily = DmSansFontFamily,
                            color = if (isAllSelected) Color.White.copy(alpha = 0.8f) else TextMuted,
                            fontSize = 9.sp
                        )
                    }

                    // Class 1 to 12 tiles
                    viewModel.classFilters.forEach { filter ->
                        val isSelected = selectedClass == filter.level
                        Column(
                            modifier = Modifier
                                .width(86.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(if (isSelected) ForestBrand else CardWhite)
                                .border(1.dp, if (isSelected) ForestBrand else BorderCard, RoundedCornerShape(14.dp))
                                .clickable { viewModel.setShopClassFilter(filter.level) }
                                .padding(10.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "CLASS",
                                fontFamily = DmSansFontFamily,
                                color = if (isSelected) GoldSand else TextMuted,
                                fontSize = 8.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = String.format("%02d", filter.level),
                                fontFamily = PlayfairDisplayFontFamily,
                                color = if (isSelected) Color.White else ForestTitle,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "${filter.bookCount} titles",
                                fontFamily = DmSansFontFamily,
                                color = if (isSelected) Color.White.copy(alpha = 0.8f) else TextMuted,
                                fontSize = 9.sp
                            )
                        }
                    }
                }
            }
        }

        // Browse a subject chips
        item(span = { GridItemSpan(2) }) {
            Column(modifier = Modifier.padding(top = 8.dp)) {
                Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                    Text(
                        text = "ONE SUBJECT AT A TIME",
                        fontFamily = DmSansFontFamily,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = ForestBrand,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "Or browse a subject",
                        fontSize = 20.sp,
                        fontFamily = PlayfairDisplayFontFamily,
                        fontWeight = FontWeight.Bold,
                        color = ForestTitle
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val isAllSubj = selectedSubject.isBlank()
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(if (isAllSubj) ForestBrand else CardWhite)
                            .border(1.dp, if (isAllSubj) ForestBrand else BorderCard, RoundedCornerShape(20.dp))
                            .clickable { viewModel.setShopSubjectFilter("") }
                            .padding(horizontal = 14.dp, vertical = 7.dp)
                    ) {
                        Text(
                            text = "All subjects",
                            fontFamily = DmSansFontFamily,
                            color = if (isAllSubj) Color.White else ForestTitle,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    viewModel.subjectFilters.forEach { s ->
                        val isSelected = selectedSubject.equals(s.name, ignoreCase = true)
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(if (isSelected) ForestBrand else CardWhite)
                                .border(1.dp, if (isSelected) ForestBrand else BorderCard, RoundedCornerShape(20.dp))
                                .clickable { viewModel.setShopSubjectFilter(s.name) }
                                .padding(horizontal = 14.dp, vertical = 7.dp)
                        ) {
                            Text(
                                text = "${s.name}  ${s.bookCount}",
                                fontFamily = DmSansFontFamily,
                                color = if (isSelected) Color.White else ForestTitle,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }
        }

        // Subject Bundles Section
        item(span = { GridItemSpan(2) }) {
            SubjectBundlesSection(
                books = books,
                addingBundleKey = addingBundleKey,
                onAddBundle = { key, bundleBooks ->
                    viewModel.addBundle(key, bundleBooks)
                }
            )
        }

        // Section heading for Books grid
        item(span = { GridItemSpan(2) }) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Column {
                    Text(
                        text = when {
                            selectedClass != null -> "CLASS $selectedClass"
                            selectedSubject.isNotBlank() -> selectedSubject.uppercase()
                            else -> "HAND-PICKED FOR THE CLASSROOM"
                        },
                        fontFamily = DmSansFontFamily,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = ForestBrand,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = when {
                            selectedSubject.isNotBlank() -> "$selectedSubject favourites"
                            selectedClass != null -> "Books for Class $selectedClass"
                            else -> "Popular this week"
                        },
                        fontSize = 20.sp,
                        fontFamily = PlayfairDisplayFontFamily,
                        fontWeight = FontWeight.Bold,
                        color = ForestTitle
                    )
                }
                Text(
                    text = "See all titles →",
                    fontFamily = DmSansFontFamily,
                    color = ForestBrand,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable { onNavigateToSearch() }
                )
            }
        }

        // Book Cards Grid
        if (books.isEmpty()) {
            item(span = { GridItemSpan(2) }) {
                EmptyState(
                    title = "No titles in this corner yet.",
                    text = "Try another class or subject to find your books.",
                    actionLabel = "Browse all books",
                    onActionClick = {
                        viewModel.setShopClassFilter(null)
                        viewModel.setShopSubjectFilter("")
                    }
                )
            }
        } else {
            items(books, key = { it.id }) { book ->
                Box(modifier = Modifier.padding(start = 16.dp, end = 4.dp)) {
                    BookCard(
                        book = book,
                        isFavorite = savedIds.contains(book.id),
                        isAdding = addingBookId == book.id,
                        isAdded = addedBookId == book.id,
                        onAddToCart = { viewModel.addToCart(book) },
                        onToggleFavorite = { viewModel.toggleFavorite(book.id) }
                    )
                }
            }
        }

        // Collection Note Banner
        item(span = { GridItemSpan(2) }) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(CardWhite)
                    .border(1.dp, BorderCard, RoundedCornerShape(16.dp))
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(RoundedCornerShape(13.dp, 13.dp, 13.dp, 4.dp))
                        .background(ForestBrand),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.AutoStories,
                        contentDescription = null,
                        tint = Color(0xFFF8F1D9),
                        modifier = Modifier.size(22.dp)
                    )
                }
                Spacer(modifier = Modifier.width(14.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Every book has a place on the list.",
                        fontFamily = DmSansFontFamily,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = ForestTitle
                    )
                    Text(
                        text = "${viewModel.catalogSummary.bookCount} carefully selected titles, ready for the new term.",
                        fontFamily = DmSansFontFamily,
                        fontSize = 11.sp,
                        color = TextMuted
                    )
                }
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .clip(CircleShape)
                        .background(ForestBrand)
                        .clickable { onNavigateToSearch() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Search",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }

        // Bottom space so content doesn't get obscured by bottom navigation bar
        item(span = { GridItemSpan(2) }) {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
