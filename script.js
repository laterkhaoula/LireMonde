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

