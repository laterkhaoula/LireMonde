const API_URL = "http://localhost:3004/books";
let allBooks = [];
let currentGenre = "Tous";

// 1. Navigation SPA (Db kantsauvegarda l-page f localStorage)
// Ila malqanach chi page mkhbya, kandiro 'accueil' hiya l-lella
let currentPage = localStorage.getItem('currentPage') || "accueil";

function switchPage(pageId) {
    currentPage = pageId; 
    localStorage.setItem('currentPage', pageId); // Sauvegardi l-page l-haliya f l-browser
    
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // التعديل هنا: كاخفاو لبار ديال البحث يلا كنا ف الأدمين أو ف صفحة alire
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        if (pageId === 'admin' || pageId === 'alire') {
            searchInput.style.display = 'none'; 
        } else {
            searchInput.style.display = 'block'; 
        }
    }
    
    render(); 
}

// 2. Fetch data de l'API
async function fetchBooks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Erreur réseau");
        allBooks = await response.json();
        render();
    } catch (error) {
        console.error("Impossible de charger les livres:", error);
    }
}

// 3. Render General (Db kay-affichi ghir l-page l-haliya li nta fiha)
function render() {
    if (currentPage === 'accueil') {
        renderAccueil();
        renderGenres();
    } else if (currentPage === 'alire') {
        renderALire();
    } else if (currentPage === 'admin') {
        renderAdminTable();
    }
}

// 4. Page d'accueil (Grille + Recherche + Filtrage)
function renderAccueil() {
    const container = document.getElementById('books-container');
    if (!container) return;
    
    const searchElement = document.getElementById('globalSearch');
    const searchVal = searchElement ? searchElement.value.toLowerCase() : "";
    
    container.innerHTML = "";
    
    const filtered = allBooks.filter(book => {
        const matchGenre = (currentGenre === "Tous" || book.genre === currentGenre);
        const matchSearch = book.titre.toLowerCase().includes(searchVal) || book.auteur.toLowerCase().includes(searchVal);
        return matchGenre && matchSearch;
    });

    filtered.forEach(book => {
        container.innerHTML += `
            <div class="book-card">
                <img src="${book.couverture}" alt="${book.titre}" onclick="openModal('${book.id}')">
                <h3>${book.titre}</h3>
                <p>${book.auteur}</p>
                <button type="button" onclick="toggleALire('${book.id}')">${book.aLire ? 'Retirer ❤️' : 'À lire ♡'}</button>
            </div>
        `;
    });
}

// 5. Générer dynamiquement les boutons de genres
function renderGenres() {
    const container = document.getElementById('genres-container');
    if (!container) return;
    
    const genres = ["Tous", ...new Set(allBooks.map(b => b.genre))];
    
    container.innerHTML = genres.map(genre => `
        <button type="button" class="${currentGenre === genre ? 'active' : ''}" onclick="filterByGenre('${genre}')">${genre}</button>
    `).join('');
}

function filterByGenre(genre) {
    currentGenre = genre;
    renderAccueil();
    renderGenres();
}

function handleSearch() {
    renderAccueil();
}

// 6. Page "À Lire"
function renderALire() {
    const container = document.getElementById('alire-container');
    if (!container) return;
    
    container.innerHTML = "";
    
    const favorites = allBooks.filter(b => b.aLire);
    if(favorites.length === 0) {
        container.innerHTML = "<p>Aucun livre dans votre liste d'attente.</p>";
        return;
    }

    favorites.forEach(book => {
        container.innerHTML += `
            <div class="book-card">
                <img src="${book.couverture}" alt="${book.titre}" onclick="openModal('${book.id}')">
                <h3>${book.titre}</h3>
                <p>${book.auteur}</p>
                <button type="button" onclick="toggleALire('${book.id}')">Retirer</button>
            </div>
        `;
    });
}

// 7. Toggle À Lire (PATCH API)
async function toggleALire(id) {
    const book = allBooks.find(b => b.id === id);
    if (!book) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aLire: !book.aLire })
        });
        if(response.ok) {
            book.aLire = !book.aLire; 
            render();
        }
    } catch (error) { console.error(error); }
}

// 8. Modale Détails
function openModal(id) {
    const book = allBooks.find(b => b.id === id);
    if (!book) return;
    
    const content = document.getElementById('modal-body-content');
    if (!content) return;
    
    content.innerHTML = `
        <div style="display:flex; gap:20px; flex-wrap: wrap;">
            <img src="${book.couverture}" style="width:150px; height:220px; object-fit:cover; border-radius:4px;">
            <div style="flex: 1; min-width: 250px;">
                <h2>${book.titre}</h2>
                <p><strong>Auteur :</strong> ${book.auteur}</p>
                <p><strong>Genre :</strong> ${book.genre}</p>
                <p>${book.description}</p>
                <button type="button" onclick="closeModal(); toggleALire('${book.id}');" style="padding: 8px 15px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                    ${book.aLire ? 'Retirer de la liste' : 'Ajouter à la liste'}
                </button>
            </div>
        </div>
    `;
    document.getElementById('book-modal').style.display = 'flex';
}
function closeModal() { document.getElementById('book-modal').style.display = 'none'; }
function scrollToBooks() {
    const booksContainer = document.getElementById('books-container');
    if (booksContainer) {
        booksContainer.scrollIntoView({ behavior: 'smooth' });
    }
}


// ================= CRUD ADMIN =================

// 9. Préparer le formulaire pour un NOUVEL AJOUT
function ouvrirFormulaireAjout() {
    const form = document.getElementById('book-form');
    if (form) form.reset();
    
    document.getElementById('book-id').value = "";
    document.getElementById('form-btn').innerText = "Ajouter le livre";
    
    if (form) form.scrollIntoView({ behavior: 'smooth' });
}

// 10. Affichage Tableau Admin
function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = "";
    allBooks.forEach(book => {
        tbody.innerHTML += `
            <tr>
                <td><img src="${book.couverture}" style="width:50px; height:70px; object-fit:cover;"></td>
                <td>${book.titre}</td>
                <td>${book.auteur}</td>
                <td>${book.genre}</td>
                <td>
                    <button type="button" onclick="setupEdit('${book.id}')" style="background: #e6b800; color: white;">Modifier</button>
                    <button type="button" onclick="deleteBook('${book.id}')" style="background:#ff4d4d; color:white;">Supprimer</button>
                </td>
            </tr>
        `;
    });
}

// 11. Formulaire : Soumission (Ajouter OU Modifier via POST / PUT API)
const bookForm = document.getElementById('book-form');
if (bookForm) {
    bookForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('book-id').value;
        const bookData = {
            titre: document.getElementById('book-title').value,
            auteur: document.getElementById('book-author').value,
            genre: document.getElementById('book-genre').value,
            couverture: document.getElementById('book-cover').value,
            description: document.getElementById('book-desc').value,
            aLire: id ? (allBooks.find(b => b.id === id)?.aLire || false) : false
        };

        try {
            if (id) { // Mode Edition (PUT)
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookData)
                });
                if(response.ok) await fetchBooks();
            } else { // Mode Ajout (POST)
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookData)
                });
                if(response.ok) await fetchBooks();
            }
            
            document.getElementById('book-form').reset();
            document.getElementById('book-id').value = "";
            document.getElementById('form-btn').innerText = "Ajouter le livre";
        } catch(error) { console.error(error); }
    });
}

// 12. Setup Modification (PUT)
function setupEdit(id) {
    const book = allBooks.find(b => b.id === id);
    if (!book) return;
    
    document.getElementById('book-id').value = book.id;
    document.getElementById('book-title').value = book.titre;
    document.getElementById('book-author').value = book.auteur;
    document.getElementById('book-genre').value = book.genre;
    document.getElementById('book-cover').value = book.couverture;
    document.getElementById('book-desc').value = book.description;
    document.getElementById('form-btn').innerText = "Enregistrer les modifications";
    
    const form = document.getElementById('book-form');
    if (form) form.scrollIntoView({ behavior: 'smooth' });
}

// 13. Supprimer (DELETE API)
async function deleteBook(id) {
    if(confirm("Voulez-vous vraiment supprimer ce livre ?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if(response.ok) await fetchBooks(); 
        } catch(error) { console.error(error); }
    }
}

// 14. Au chargement dyal l-page
window.onload = async () => {
    await fetchBooks(); // 1. Njibo l-data mn l-API dima l-oula
    switchPage(currentPage); // 2. N-activew l-page li knti fiha akhir mra automatic mn localStorage
};