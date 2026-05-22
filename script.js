const API_URL = "http://localhost:3000/books";

/* ======================================
   DETECTION DES PAGES
====================================== */

const booksContainer = document.getElementById("books-grid-container");
const alireContainer = document.getElementById("alire-grid-container");
const tableBody = document.getElementById("admin-table-body");

/* ======================================
   VARIABLES GLOBALES
====================================== */

let books = [];
let currentBook = null;

/* ======================================
   ACCUEIL ELEMENTS
====================================== */

const genreFilter = document.getElementById("genre-filter");
const searchInput = document.getElementById("global-search");

const modal = document.getElementById("book-modal");
const closeModalBtn = document.getElementById("close-modal-btn");

const modalCover = document.getElementById("modal-cover");
const modalTitle = document.getElementById("modal-title");
const modalAuthor = document.getElementById("modal-author");
const modalGenre = document.getElementById("modal-genre");
const modalDescription = document.getElementById("modal-description");
const modalToggleBtn = document.getElementById("modal-toggle-alire-btn");

/* ======================================
   ADMIN ELEMENTS
====================================== */

const form = document.getElementById("admin-book-form");

const bookIdInput = document.getElementById("book-id");

const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const genreInput = document.getElementById("genre");
const coverInput = document.getElementById("cover");
const descriptionInput = document.getElementById("description");

const formTitle = document.getElementById("form-action-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

/* ======================================
   FETCH BOOKS
====================================== */

async function fetchBooks() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Erreur chargement");
        }

        books = await response.json();

        /* PAGE ACCUEIL */
        if (booksContainer) {

            displayBooks(books);
            generateGenres(books);
        }

        /* PAGE A LIRE */
        if (alireContainer) {

            const favorites = books.filter(book => book.aLire);

            displayALireBooks(favorites);
        }

        /* PAGE ADMIN */
        if (tableBody) {

            displayAdminBooks(books);
        }

    } catch (error) {

        console.error(error);

        if (booksContainer) {
            booksContainer.innerHTML = "<p>Erreur chargement livres</p>";
        }

        if (alireContainer) {
            alireContainer.innerHTML = "<p>Erreur chargement livres</p>";
        }

        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">Erreur chargement</td>
                </tr>
            `;
        }
    }
}

/* ======================================
   DISPLAY BOOKS ACCUEIL
====================================== */

function displayBooks(data) {

    booksContainer.innerHTML = "";

    if (data.length === 0) {

        booksContainer.innerHTML = `
            <p>Aucun livre trouvé.</p>
        `;

        return;
    }

    data.forEach(book => {

        const card = document.createElement("div");

        card.classList.add("book-card");

        card.innerHTML = `
            <img src="${book.couverture}" alt="${book.titre}">
            <h3>${book.titre}</h3>
            <p>${book.auteur}</p>
        `;

        card.addEventListener("click", () => {
            openModal(book);
        });

        booksContainer.appendChild(card);
    });
}

/* ======================================
   GENERATE GENRES
====================================== */

function generateGenres(data) {

    if (!genreFilter) return;

    genreFilter.innerHTML = `
        <option value="all">Tous les genres</option>
    `;

    const genres = [...new Set(data.map(book => book.genre))];

    genres.forEach(genre => {

        const option = document.createElement("option");

        option.value = genre;
        option.textContent = genre;

        genreFilter.appendChild(option);
    });
}

/* ======================================
   FILTRE
====================================== */

if (genreFilter) {

    genreFilter.addEventListener("change", filterBooks);
}

if (searchInput) {

    searchInput.addEventListener("input", filterBooks);
}

function filterBooks() {

    const selectedGenre = genreFilter.value;
    const searchValue = searchInput.value.toLowerCase();

    let filteredBooks = books;

    if (selectedGenre !== "all") {

        filteredBooks = filteredBooks.filter(book =>
            book.genre === selectedGenre
        );
    }

    filteredBooks = filteredBooks.filter(book =>

        book.titre.toLowerCase().includes(searchValue) ||
        book.auteur.toLowerCase().includes(searchValue)
    );

    displayBooks(filteredBooks);
}

/* ======================================
   MODAL
====================================== */

function openModal(book) {

    currentBook = book;

    modal.style.display = "flex";

    modalCover.src = book.couverture;
    modalTitle.textContent = book.titre;
    modalAuthor.textContent = book.auteur;
    modalGenre.textContent = book.genre;
    modalDescription.textContent = book.description;

    updateModalButton(book.aLire);
}

/* ======================================
   CLOSE MODAL
====================================== */

if (closeModalBtn) {

    closeModalBtn.addEventListener("click", () => {

        modal.style.display = "none";
    });
}

window.addEventListener("click", (e) => {

    if (e.target === modal) {

        modal.style.display = "none";
    }
});

/* ======================================
   UPDATE BUTTON
====================================== */

function updateModalButton(isInList) {

    if (isInList) {

        modalToggleBtn.textContent = `
            Retirer de la liste "À lire"
        `;

    } else {

        modalToggleBtn.textContent = `
            Ajouter à la liste "À lire"
        `;
    }
}

/* ======================================
   TOGGLE A LIRE
====================================== */

if (modalToggleBtn) {

    modalToggleBtn.addEventListener("click", async () => {

        if (!currentBook) return;

        try {

            const response = await fetch(`${API_URL}/${currentBook.id}`, {

                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    aLire: !currentBook.aLire
                })
            });

            if (!response.ok) {

                throw new Error("Erreur mise à jour");
            }

            currentBook.aLire = !currentBook.aLire;

            updateModalButton(currentBook.aLire);

            fetchBooks();

        } catch (error) {

            console.error(error);

            alert("Erreur réseau");
        }
    });
}

/* ======================================
   PAGE A LIRE
====================================== */

function displayALireBooks(data) {

    alireContainer.innerHTML = "";

    if (data.length === 0) {

        alireContainer.innerHTML = `
            <p>Aucun livre dans votre liste.</p>
        `;

        return;
    }

    data.forEach(book => {

        const card = document.createElement("div");

        card.classList.add("book-card");

        card.innerHTML = `
            <img src="${book.couverture}">
            <h3>${book.titre}</h3>
            <p>${book.auteur}</p>

            <button class="btn-delete remove-btn">
                Retirer
            </button>
        `;

        const removeBtn = card.querySelector(".remove-btn");

        removeBtn.addEventListener("click", async () => {

            try {

                const response = await fetch(`${API_URL}/${book.id}`, {

                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        aLire: false
                    })
                });

                if (!response.ok) {

                    throw new Error("Erreur suppression");
                }

                fetchBooks();

            } catch (error) {

                console.error(error);

                alert("Erreur réseau");
            }
        });

        alireContainer.appendChild(card);
    });
}

/* ======================================
   DISPLAY ADMIN TABLE
====================================== */

function displayAdminBooks(data) {

    tableBody.innerHTML = "";

    data.forEach(book => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <img src="${book.couverture}">
            </td>

            <td>${book.titre}</td>
            <td>${book.auteur}</td>
            <td>${book.genre}</td>

            <td>
                <button class="btn-submit edit-btn">
                    Modifier
                </button>

                <button class="btn-delete delete-btn">
                    Supprimer
                </button>
            </td>
        `;

        /* EDIT */
        row.querySelector(".edit-btn")
            .addEventListener("click", () => {
                fillForm(book);
            });

        /* DELETE */
        row.querySelector(".delete-btn")
            .addEventListener("click", () => {
                deleteBook(book.id);
            });

        tableBody.appendChild(row);
    });
}

/* ======================================
   ADD / UPDATE BOOK
====================================== */

if (form) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const bookData = {

            titre: titleInput.value,
            auteur: authorInput.value,
            genre: genreInput.value,
            couverture: coverInput.value,
            description: descriptionInput.value,
            aLire: false
        };

        const bookId = bookIdInput.value;

        try {

            /* UPDATE */
            if (bookId) {

                const response = await fetch(`${API_URL}/${bookId}`, {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(bookData)
                });

                if (!response.ok) {

                    throw new Error("Erreur modification");
                }

            } else {

                /* ADD */
                const response = await fetch(API_URL, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(bookData)
                });

                if (!response.ok) {

                    throw new Error("Erreur ajout");
                }
            }

            form.reset();

            resetForm();

            fetchBooks();

        } catch (error) {

            console.error(error);

            alert("Erreur réseau");
        }
    });
}

/* ======================================
   DELETE BOOK
====================================== */

async function deleteBook(id) {

    const confirmDelete = confirm("Supprimer ce livre ?");

    if (!confirmDelete) return;

    try {

        const response = await fetch(`${API_URL}/${id}`, {

            method: "DELETE"
        });

        if (!response.ok) {

            throw new Error("Erreur suppression");
        }

        fetchBooks();

    } catch (error) {

        console.error(error);

        alert("Erreur réseau");
    }
}

/* ======================================
   FILL FORM
====================================== */

function fillForm(book) {

    bookIdInput.value = book.id;

    titleInput.value = book.titre;
    authorInput.value = book.auteur;
    genreInput.value = book.genre;
    coverInput.value = book.couverture;
    descriptionInput.value = book.description;

    formTitle.textContent = "Modifier le livre";

    submitBtn.textContent = "Mettre à jour";

    cancelEditBtn.style.display = "inline-block";
}

/* ======================================
   CANCEL EDIT
====================================== */

if (cancelEditBtn) {

    cancelEditBtn.addEventListener("click", () => {

        form.reset();

        resetForm();
    });
}

/* ======================================
   RESET FORM
====================================== */

