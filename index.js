import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, set, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
    databaseURL: "https://book-94f66-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const booksInDB = ref(database, "books_list");

const inputFieldEl = document.getElementById("input-field");
const addButtonEl = document.getElementById("add-button");
const readStatusSelectEl = document.getElementById("read-status");
const booksListEl = document.getElementById("books_list");
const deleteButtonEl = document.getElementById("delete-button");

deleteButtonEl.addEventListener("click", function() {
    deleteReadBooks();
});
addButtonEl.addEventListener("click", function() {
    let inputValue = inputFieldEl.value;
    let isRead = readStatusSelectEl.value === 'read';

    push(booksInDB, { title: inputValue, read: isRead });
    clearInputFieldEl();
});

onValue(booksInDB, function(snapshot) {
    if (snapshot.exists()) {
        let booksArray = Object.entries(snapshot.val());
        clearBooksListEl();
        for (let i = 0; i < booksArray.length; i++) {
            let currentBook = booksArray[i];
            let bookID = currentBook[0];
            let bookData = currentBook[1];
            appendBookToBooksListEl(booksListEl, bookID, bookData);
        }
    } else {
        clearBooksListEl();
    }
});



function clearBooksListEl() {
    booksListEl.innerHTML = "";
}

function clearInputFieldEl() {
    inputFieldEl.value = "";
}

function appendBookToBooksListEl(booksListEl, bookID, bookData) {
    let newEl = document.createElement("li");
    newEl.textContent = `${bookData.title} - ${bookData.read ? 'Read' : 'Unread'}`;
    newEl.dataset.id = bookID; 
    newEl.addEventListener("click", function() {
        let exactLocationOfBookInDB = ref(database, `books_list/${bookID}`);
        let updatedReadStatus = !bookData.read;
        set(exactLocationOfBookInDB, { title: bookData.title, read: updatedReadStatus });
    });

    booksListEl.append(newEl);
}

function deleteReadBooks() {
    const selectedBooks = booksListEl.querySelectorAll("li");

    selectedBooks.forEach((selectedBook) => {
        const bookID = selectedBook.dataset.id;
        const isRead = selectedBook.textContent.trim().endsWith("Read");

        if (isRead) {
            const exactLocationOfBookInDB = ref(database, `books_list/${bookID}`);
            remove(exactLocationOfBookInDB)
                .then(() => {
                    selectedBook.remove(); // Видалення елемента з DOM
                })
                .catch((error) => {
                    console.error(`Error deleting book with ID ${bookID} from the database:`, error);
                });
        }
    });
}

