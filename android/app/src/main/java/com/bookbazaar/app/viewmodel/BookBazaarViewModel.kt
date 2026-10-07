package com.bookbazaar.app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.bookbazaar.app.data.BookBazaarRepository
import com.bookbazaar.app.model.Book
import com.bookbazaar.app.model.Cart
import com.bookbazaar.app.model.CatalogSummary
import com.bookbazaar.app.model.ClassFilter
import com.bookbazaar.app.model.Order
import com.bookbazaar.app.model.Promotion
import com.bookbazaar.app.model.SubjectFilter
import com.bookbazaar.app.model.User
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class BookBazaarViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = BookBazaarRepository(application)

    val user: StateFlow<User> = repository.user
    val cart: StateFlow<Cart> = repository.cart
    val orders: StateFlow<List<Order>> = repository.orders
    val promotions: StateFlow<List<Promotion>> = repository.promotions
    val savedBookIds: StateFlow<Set<String>> = repository.savedBookIds

    val classFilters: List<ClassFilter> = repository.getClassFilters()
    val subjectFilters: List<SubjectFilter> = repository.getSubjectFilters()
    val catalogSummary: CatalogSummary = repository.getCatalogSummary()

    // Shop & Filter states
    val selectedShopClass = MutableStateFlow<Int?>(null)
    val selectedShopSubject = MutableStateFlow("")

    val shopBooks: StateFlow<List<Book>> = combine(
        repository.books,
        selectedShopClass,
        selectedShopSubject
    ) { _, classLevel, subject ->
        repository.filterBooks(
            classLevel = classLevel,
            subject = subject,
            limit = 12
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Search page states
    val searchQuery = MutableStateFlow("")
    val searchClass = MutableStateFlow<Int?>(null)
    val searchSubject = MutableStateFlow("")
    val searchDealOnly = MutableStateFlow(false)

    val searchBooks: StateFlow<List<Book>> = combine(
        repository.books,
        searchQuery,
        searchClass,
        searchSubject,
        searchDealOnly
    ) { _, q, cls, subj, deals ->
        repository.filterBooks(
            query = q,
            classLevel = cls,
            subject = subj,
            dealOnly = deals,
            limit = 30
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // UI Feedback states
    val addingBookId = MutableStateFlow<String?>(null)
    val addedBookId = MutableStateFlow<String?>(null)
    val addingBundleKey = MutableStateFlow<String?>(null)

    // Order Placement State
    val isPlacingOrder = MutableStateFlow(false)
    val lastPlacedOrderId = MutableStateFlow<String?>(null)

    fun addToCart(book: Book) {
        viewModelScope.launch {
            addingBookId.value = book.id
            delay(150) // smooth micro interaction
            repository.addToCart(book.id, 1)
            addingBookId.value = null
            addedBookId.value = book.id
            delay(1300) // matches web 1300ms feedback timeout
            if (addedBookId.value == book.id) {
                addedBookId.value = null
            }
        }
    }

    fun addBundle(bundleKey: String, books: List<Book>) {
        viewModelScope.launch {
            addingBundleKey.value = bundleKey
            delay(300)
            repository.addBundle(books)
            addingBundleKey.value = null
        }
    }

    fun updateCartQuantity(bookId: String, quantity: Int) {
        repository.updateCartItemQuantity(bookId, quantity)
    }

    fun removeFromCart(bookId: String) {
        repository.removeFromCart(bookId)
    }

    fun toggleFavorite(bookId: String) {
        repository.toggleFavorite(bookId)
    }

    fun setShopClassFilter(classLevel: Int?) {
        selectedShopClass.value = if (selectedShopClass.value == classLevel) null else classLevel
    }

    fun setShopSubjectFilter(subject: String) {
        selectedShopSubject.value = if (selectedShopSubject.value == subject) "" else subject
    }

    fun clearSearchFilters() {
        searchQuery.value = ""
        searchClass.value = null
        searchSubject.value = ""
        searchDealOnly.value = false
    }

    fun placeOrder(
        customerName: String,
        phone: String,
        addressLine: String,
        city: String,
        state: String,
        postalCode: String,
        onSuccess: (String) -> Unit
    ) {
        viewModelScope.launch {
            isPlacingOrder.value = true
            delay(400) // network feel
            val order = repository.createOrder(
                customerName = customerName,
                phone = phone,
                addressLine = addressLine,
                city = city,
                state = state,
                postalCode = postalCode
            )
            isPlacingOrder.value = false
            lastPlacedOrderId.value = order.id
            onSuccess(order.id)
        }
    }

    fun resetPlacedOrder() {
        lastPlacedOrderId.value = null
    }

    fun getOrder(orderId: String): Order? {
        return repository.getOrder(orderId)
    }

    fun signIn(name: String, email: String) {
        repository.signIn(name, email)
    }

    fun signOut() {
        repository.signOut()
    }
}
