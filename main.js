let books = [];
const RENDER = 'render-book';
const STORAGE = 'BOOK_SHELF';
const data_testid = "data-testid";

document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    if (storageExist()) {
        loadSavedBooks();
        setupEventListeners();
    }
}

function loadSavedBooks() {
    const savedBooks = JSON.parse(localStorage.getItem(STORAGE));
    if (savedBooks !== null) {
        books.push(...savedBooks);
        console.log('Books loaded:', books); 
        renderBooks({});
    }
}

function storageExist() {
    if (typeof (Storage) === 'undefined') {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function setupEventListeners() {
    const submitBook = document.getElementById("bookFormSubmit");
    submitBook.addEventListener('click', handleAddBook);

    const searchButton = document.getElementById("searchSubmit");
    searchButton.addEventListener('click', (event) => {
        event.preventDefault();
        searchBook();
    });

    const updateButton = document.getElementById("updateSubmit");
    updateButton.addEventListener('click', handleUpdateBook);

    document.addEventListener(RENDER, renderBooks);
}

function searchBook() {
    const judul = document.getElementById("searchBookTitle").value;
    renderBooks({ detail: { title: judul } });
}

function handleAddBook(event) {
    event.preventDefault();
    const judul = document.getElementById('bookFormTitle').value;
    const penulis = document.getElementById('bookFormAuthor').value;
    const tahun = document.getElementById('bookFormYear').value;
    const status = document.getElementById('bookFormIsComplete').checked;

    const newBook = generateBook(judul, penulis, tahun, status);
    books.push(newBook);
    saveBooks();
    document.dispatchEvent(new Event(RENDER));
}

function handleUpdateBook(event) {
    event.preventDefault();
    const updateForm = document.getElementById('updateBookForm');
    const updateTitle = document.getElementById('updateBookTitle').value;
    const updateAuthor = document.getElementById('updateBookAuthor').value;
    const updateYear = document.getElementById('updateBookYear').value;

    const bookId = parseInt(updateForm.getAttribute('data-book-id'));
    const bookIndex = books.findIndex(book => book.id === bookId);

    if (bookIndex !== -1) {
        books[bookIndex].title = updateTitle || books[bookIndex].title;
        books[bookIndex].author = updateAuthor || books[bookIndex].author;
        books[bookIndex].year = updateYear ? parseInt(updateYear) : books[bookIndex].year;

        saveBooks();
        alert(`Book updated: ${books[bookIndex].title}`);
        updateForm.classList.add('hidden');
        document.dispatchEvent(new Event(RENDER));
    } else {
        alert('Book not found');
    }
}

function generateBook(judul, penulis, tahun, status) {
    return {
        id: new Date().getTime(),
        title: judul,
        author: penulis,
        year: parseInt(tahun),
        isComplete: status,
    };
}

function saveBooks() {
    if (storageExist()) {
        const parsedData = JSON.stringify(books);
        localStorage.setItem(STORAGE, parsedData);
    }
}

function renderBooks(event) {
    const inCompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
    inCompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    const title = event.detail && event.detail.title ? event.detail.title : null;

    books.forEach(book => {
        if (title === null || book.title.toLowerCase().includes(title.toLowerCase())) {
            const bookElement = makeBookElement(book);
            if (!book.isComplete) {
                inCompleteBookList.append(bookElement);
            } else {
                completeBookList.append(bookElement);
            }
        }
    });
}

function makeBookElement(book) {
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = book.title;
    bookTitle.setAttribute(data_testid, 'bookItemTitle');

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = book.author;
    bookAuthor.setAttribute(data_testid, 'bookItemAuthor');

    const bookYear = document.createElement('p');
    bookYear.innerText = book.year;

    const buttonCompleted = createButton('selesai dibaca', () => bookCompleted(book.id), 'button-add');
    const buttonDelete = createButton('Hapus', () => bookRemoved(book.id), 'button-delete');
    const buttonInCompleted = createButton('belum selesai', () => bookInCompleted(book.id), 'button-add');
    const buttonEdit = createButton('Edit buku', () => handleEditBook(book), 'button-edit');

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    if (!book.isComplete) {
        buttonContainer.append(buttonCompleted, buttonDelete, buttonEdit);
    } else {
        buttonContainer.append(buttonInCompleted, buttonDelete, buttonEdit);
    }

    const container = document.createElement('div');
    container.setAttribute('data-bookid', `${book.id}`);
    container.setAttribute(data_testid, "bookItem");
    container.append(bookTitle, bookAuthor, bookYear, buttonContainer);
    return container;
}


const createButton = (text, onClick, style) => {
    const button = document.createElement('button');
    button.innerText = text;
    button.classList.add(style);
    button.addEventListener('click', onClick);
    return button;
}

const handleEditBook = (book) => {
    const updateForm = document.getElementById('updateBookForm');
    updateForm.classList.remove('hidden');
    updateForm.setAttribute('data-book-id', book.id.toString());
    document.getElementById('updateBookTitle').value = book.title;
    document.getElementById('updateBookAuthor').value = book.author;
    document.getElementById('updateBookYear').value = book.year;
}

const bookCompleted = (bookId) => {
    updateBookStatus(bookId, true);
}

const bookInCompleted = (bookId) => {
    updateBookStatus(bookId, false);
}

const updateBookStatus = (bookId, isComplete) => {
    const index = books.findIndex((book) => book.id === bookId);
    if (index !== -1) {
        books[index].isComplete = isComplete;
        saveBooks();
        document.dispatchEvent(new Event(RENDER));
    }
}

const bookRemoved = (bookId) => {
    const index = books.findIndex((book) => book.id === bookId);
    if (index !== -1) {
        books.splice(index, 1);
        saveBooks();
        document.dispatchEvent(new Event(RENDER));
    }
}
