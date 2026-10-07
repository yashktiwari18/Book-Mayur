package com.bookbazaar.app.data

import android.content.Context
import android.content.SharedPreferences
import com.bookbazaar.app.model.Book
import com.bookbazaar.app.model.Cart
import com.bookbazaar.app.model.CartItem
import com.bookbazaar.app.model.CatalogSummary
import com.bookbazaar.app.model.ClassFilter
import com.bookbazaar.app.model.Order
import com.bookbazaar.app.model.OrderItem
import com.bookbazaar.app.model.Promotion
import com.bookbazaar.app.model.SubjectFilter
import com.bookbazaar.app.model.User
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

class BookBazaarRepository(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("book_bazaar_prefs", Context.MODE_PRIVATE)
    private val gson = Gson()

    private val _books = MutableStateFlow(BookBazaarData.MOCK_BOOKS)
    val books: StateFlow<List<Book>> = _books.asStateFlow()

    private val _promotions = MutableStateFlow(BookBazaarData.MOCK_PROMOTIONS)
    val promotions: StateFlow<List<Promotion>> = _promotions.asStateFlow()

    private val _cart = MutableStateFlow(Cart())
    val cart: StateFlow<Cart> = _cart.asStateFlow()

    private val _orders = MutableStateFlow<List<Order>>(emptyList())
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()

    private val _user = MutableStateFlow(User())
    val user: StateFlow<User> = _user.asStateFlow()

    private val _savedBookIds = MutableStateFlow<Set<String>>(emptySet())
    val savedBookIds: StateFlow<Set<String>> = _savedBookIds.asStateFlow()

    init {
        loadSavedUser()
        loadSavedFavorites()
        loadCart()
        loadOrders()
    }

    private data class StoredCartItem(val bookId: String, val quantity: Int)

    private fun loadCart() {
        val json = prefs.getString("cart_items", null)
        val storedItems: List<StoredCartItem> = if (json != null) {
            val type = object : TypeToken<List<StoredCartItem>>() {}.type
            try {
                gson.fromJson(json, type) ?: emptyList()
            } catch (e: Exception) {
                defaultCartItems()
            }
        } else {
            defaultCartItems()
        }

        recalculateCart(storedItems)
    }

    private fun defaultCartItems(): List<StoredCartItem> = listOf(
        StoredCartItem("math-5-core", 1),
        StoredCartItem("science-4", 1)
    )

    private fun recalculateCart(storedItems: List<StoredCartItem>) {
        val cartItems = mutableListOf<CartItem>()
        for (item in storedItems) {
            val book = _books.value.find { it.id == item.bookId }
            if (book != null) {
                cartItems.add(
                    CartItem(
                        book = book,
                        quantity = item.quantity,
                        lineTotal = book.price * item.quantity
                    )
                )
            }
        }
        val count = cartItems.sumOf { it.quantity }
        val subtotal = cartItems.sumOf { it.lineTotal }
        _cart.value = Cart(items = cartItems, itemCount = count, subtotal = subtotal)
    }

    private fun saveCartInternal() {
        val stored = _cart.value.items.map { StoredCartItem(it.book.id, it.quantity) }
        prefs.edit().putString("cart_items", gson.toJson(stored)).apply()
    }

    fun addToCart(bookId: String, quantity: Int = 1) {
        val currentItems = _cart.value.items.toMutableList()
        val existingIndex = currentItems.indexOfFirst { it.book.id == bookId }
        val book = _books.value.find { it.id == bookId } ?: return

        if (existingIndex >= 0) {
            val current = currentItems[existingIndex]
            val newQty = (current.quantity + quantity).coerceAtMost(20)
            currentItems[existingIndex] = current.copy(
                quantity = newQty,
                lineTotal = book.price * newQty
            )
        } else {
            currentItems.add(
                CartItem(
                    book = book,
                    quantity = quantity.coerceAtMost(20),
                    lineTotal = book.price * quantity
                )
            )
        }

        val count = currentItems.sumOf { it.quantity }
        val subtotal = currentItems.sumOf { it.lineTotal }
        _cart.value = Cart(items = currentItems, itemCount = count, subtotal = subtotal)
        saveCartInternal()
    }

    fun updateCartItemQuantity(bookId: String, quantity: Int) {
        if (quantity <= 0) {
            removeFromCart(bookId)
            return
        }
        val currentItems = _cart.value.items.toMutableList()
        val index = currentItems.indexOfFirst { it.book.id == bookId }
        if (index >= 0) {
            val current = currentItems[index]
            val validQty = quantity.coerceIn(1, 20)
            currentItems[index] = current.copy(
                quantity = validQty,
                lineTotal = current.book.price * validQty
            )
            val count = currentItems.sumOf { it.quantity }
            val subtotal = currentItems.sumOf { it.lineTotal }
            _cart.value = Cart(items = currentItems, itemCount = count, subtotal = subtotal)
            saveCartInternal()
        }
    }

    fun removeFromCart(bookId: String) {
        val filtered = _cart.value.items.filterNot { it.book.id == bookId }
        val count = filtered.sumOf { it.quantity }
        val subtotal = filtered.sumOf { it.lineTotal }
        _cart.value = Cart(items = filtered, itemCount = count, subtotal = subtotal)
        saveCartInternal()
    }

    fun addBundle(bundleBooks: List<Book>) {
        for (book in bundleBooks) {
            addToCart(book.id, 1)
        }
    }

    fun clearCart() {
        _cart.value = Cart(emptyList(), 0, 0)
        prefs.edit().remove("cart_items").apply()
    }

    private fun loadOrders() {
        val json = prefs.getString("orders", null)
        val loaded: List<Order> = if (json != null) {
            val type = object : TypeToken<List<Order>>() {}.type
            try {
                gson.fromJson(json, type) ?: listOf(BookBazaarData.getSampleOrder())
            } catch (e: Exception) {
                listOf(BookBazaarData.getSampleOrder())
            }
        } else {
            listOf(BookBazaarData.getSampleOrder())
        }
        _orders.value = loaded
    }

    private fun saveOrdersInternal() {
        prefs.edit().putString("orders", gson.toJson(_orders.value)).apply()
    }

    fun createOrder(
        customerName: String,
        phone: String,
        addressLine: String,
        city: String,
        state: String,
        postalCode: String
    ): Order {
        val currentCart = _cart.value
        val randomSuffix = UUID.randomUUID().toString().replace("-", "").take(8).uppercase()
        val orderId = "ORD-$randomSuffix"

        val orderItems = currentCart.items.map { item ->
            OrderItem(
                orderId = orderId,
                bookId = item.book.id,
                title = item.book.title,
                imageUrl = item.book.imageUrl,
                unitPrice = item.book.price,
                quantity = item.quantity,
                lineTotal = item.lineTotal
            )
        }

        val dateStr = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).format(Date())

        val order = Order(
            id = orderId,
            userId = _user.value.id,
            status = "placed",
            paymentMethod = "cash_on_delivery",
            itemCount = currentCart.itemCount,
            total = currentCart.subtotal,
            customerName = customerName,
            phone = phone,
            addressLine = addressLine,
            city = city,
            state = state,
            postalCode = postalCode,
            createdAt = dateStr,
            items = orderItems
        )

        val updatedOrders = listOf(order) + _orders.value
        _orders.value = updatedOrders
        saveOrdersInternal()
        clearCart()
        return order
    }

    fun getOrder(orderId: String): Order? {
        return _orders.value.find { it.id.equals(orderId, ignoreCase = true) }
    }

    fun getCatalogSummary(): CatalogSummary {
        val allBooks = _books.value
        val subjects = allBooks.map { it.subject }.toSet()
        return CatalogSummary(
            bookCount = allBooks.size,
            classCount = 12,
            subjectCount = subjects.size,
            promotionCount = _promotions.value.size
        )
    }

    fun getClassFilters(): List<ClassFilter> {
        val allBooks = _books.value
        val counts = allBooks.groupBy { it.classLevel }.mapValues { it.value.size }
        return (1..12).map { level ->
            ClassFilter(
                level = level,
                label = "Class $level",
                bookCount = counts[level] ?: 0
            )
        }
    }

    fun getSubjectFilters(): List<SubjectFilter> {
        val allBooks = _books.value
        return allBooks.groupBy { it.subject }
            .map { (subject, list) -> SubjectFilter(subject, list.size) }
            .sortedBy { it.name }
    }

    fun filterBooks(
        query: String = "",
        classLevel: Int? = null,
        subject: String = "",
        dealOnly: Boolean = false,
        limit: Int? = null
    ): List<Book> {
        var result = _books.value

        if (query.isNotBlank()) {
            val q = query.trim().lowercase(Locale.ROOT)
            result = result.filter { book ->
                book.title.lowercase(Locale.ROOT).contains(q) ||
                    book.author.lowercase(Locale.ROOT).contains(q) ||
                    book.subject.lowercase(Locale.ROOT).contains(q)
            }
        }

        if (classLevel != null && classLevel > 0) {
            result = result.filter { it.classLevel == classLevel }
        }

        if (subject.isNotBlank()) {
            result = result.filter { it.subject.equals(subject, ignoreCase = true) }
        }

        if (dealOnly) {
            result = result.filter { it.price < it.originalPrice }
        }

        if (limit != null && limit > 0) {
            result = result.take(limit)
        }

        return result
    }

    fun toggleFavorite(bookId: String) {
        val current = _savedBookIds.value.toMutableSet()
        if (current.contains(bookId)) {
            current.remove(bookId)
        } else {
            current.add(bookId)
        }
        _savedBookIds.value = current
        prefs.edit().putStringSet("favorites", current).apply()
    }

    private fun loadSavedFavorites() {
        val saved = prefs.getStringSet("favorites", emptySet()) ?: emptySet()
        _savedBookIds.value = saved
    }

    fun signIn(name: String = "Demo Reader", email: String = "reader@bookbazaar.in") {
        val user = User(
            id = "demo_user",
            firstName = name.split(" ").firstOrNull() ?: name,
            fullName = name,
            email = email,
            isSignedIn = true
        )
        _user.value = user
        prefs.edit().putBoolean("is_signed_in", true).putString("user_name", name).putString("user_email", email).apply()
    }

    fun signOut() {
        val guest = User(
            id = "guest",
            firstName = "Guest",
            fullName = "Guest Reader",
            email = "",
            isSignedIn = false
        )
        _user.value = guest
        prefs.edit().putBoolean("is_signed_in", false).apply()
    }

    private fun loadSavedUser() {
        val isSignedIn = prefs.getBoolean("is_signed_in", true) // Default true for demo reader
        val name = prefs.getString("user_name", "Demo Reader") ?: "Demo Reader"
        val email = prefs.getString("user_email", "reader@bookbazaar.in") ?: "reader@bookbazaar.in"
        _user.value = User(
            id = if (isSignedIn) "demo_user" else "guest",
            firstName = name.split(" ").firstOrNull() ?: name,
            fullName = name,
            email = email,
            isSignedIn = isSignedIn
        )
    }
}
