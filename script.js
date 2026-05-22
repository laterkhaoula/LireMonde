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

