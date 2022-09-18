const books = []
const RENDER_EVENT = "render-book"
const SAVED_EVENT = "save-book"
const STORAGE_KEY = "bookshelf-app"

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Browser anda tidak mendukung 'Local Storage'")
    return false
  }
  return true
}

function saveToStorage() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books)
    localStorage.setItem(STORAGE_KEY, parsed)
    document.dispatchEvent(new Event(SAVED_EVENT))
  }
}

function loadFromStorage() {
  const bookData = localStorage.getItem(STORAGE_KEY)
  let data = JSON.parse(bookData)

  if (data !== null) {
    for (const book of data) {
      books.push(book)
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT))
}

const generateID = () => {
  return +new Date()
}

function generateBook(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  }
}

function addBook() {
  const id = generateID()
  const title = document.getElementById("book-title").value
  const author = document.getElementById("book-author").value
  const year = document.getElementById("book-year").value
  const isComplete = document.getElementById("book-is-complete")

  const booksObject = generateBook(id, title, author, year, isComplete.checked)
  books.push(booksObject)

  document.dispatchEvent(new Event(RENDER_EVENT))
  saveToStorage()
}

function clearForm() {
  document.getElementById("book-title").value = ""
  document.getElementById("book-author").value = ""
  document.getElementById("book-year").value = ""
  document.getElementById("book-is-complete").checked = false
  document.getElementById("keyword").value = ""

  document.dispatchEvent(new Event(RENDER_EVENT))
}

function removeBook(bookID) {
  const confir = confirm("Anda yakin ingin menghapus buku?")

  if (confir) {
    const idTarget = findBookIndex(bookID)

    if (idTarget === -1) return

    books.splice(idTarget, 1)
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveToStorage()
  }
}

const addToReadList = (bookID) => {
  const idTarget = findBookID(bookID)

  if (idTarget == null) return

  idTarget.isComplete = false
  document.dispatchEvent(new Event(RENDER_EVENT))
  saveToStorage()
}

const addToHistory = (bookID) => {
  const idTarget = findBookID(bookID)

  if (idTarget == null) return

  idTarget.isComplete = true
  document.dispatchEvent(new Event(RENDER_EVENT))
  saveToStorage()
}

function findBookID(bookID) {
  for (const bookItem of books) {
    if (bookItem.id === bookID) {
      return bookItem
    }
  }
  return null
}

function findBookIndex(bookID) {
  for (const index in books) {
    if (books[index].id === bookID) {
      return index
    }
  }

  return -1
}

const showBook = (booksObject) => {
  const htmTitle = document.createElement("h2")
  htmTitle.innerText = booksObject.title

  const htmAuthor = document.createElement("p")
  htmAuthor.innerText = "Penulis : " + booksObject.author

  const htmYear = document.createElement("p")
  htmYear.innerText = "Tahun : " + booksObject.year

  const htmBtnRead = document.createElement("button")
  htmBtnRead.classList.add("read-button")
  if (booksObject.isComplete) {
    htmBtnRead.innerText = "Baca Ulang"
    htmBtnRead.addEventListener("click", function () {
      addToReadList(booksObject.id)
    })
  } else {
    htmBtnRead.innerText = "Selesai Baca"
    htmBtnRead.addEventListener("click", function () {
      addToHistory(booksObject.id)
    })
  }

  const htmBtnDel = document.createElement("button")
  htmBtnDel.classList.add("delete-button")
  htmBtnDel.innerText = "Hapus Buku"

  htmBtnDel.addEventListener("click", function () {
    removeBook(booksObject.id)
  })

  const htmContainer = document.createElement("div")
  htmContainer.classList.add("action")
  htmContainer.append(htmBtnRead, htmBtnDel)

  const htmArticle = document.createElement("article")
  htmArticle.classList.add("book-item")
  htmArticle.append(htmTitle, htmAuthor, htmYear, htmContainer)

  return htmArticle
}

document.addEventListener("DOMContentLoaded", function () {
  const bookForm = document.getElementById("input-book")
  const searchForm = document.getElementById("search-book")

  bookForm.addEventListener("submit", function (event) {
    event.preventDefault()
    addBook()
    clearForm()
  })

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault()

    const searchResult = document.getElementById("search-result")
    searchResult.innerHTML = ""

    searchBook()
    clearForm()
  })

  if (isStorageExist()) {
    loadFromStorage()
  }
})

document.addEventListener(RENDER_EVENT, function () {
  const htmIncomplete = document.getElementById("read-list")
  htmIncomplete.innerHTML = ""

  const htmComplete = document.getElementById("history")
  htmComplete.innerHTML = ""

  for (const bookItem of books) {
    const htmBook = showBook(bookItem)
    if (bookItem.isComplete) {
      htmComplete.append(htmBook)
    } else {
      htmIncomplete.append(htmBook)
    }
  }
})

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY))
})

function getFromStorage() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
}

function searchBook() {
  const keyword = document.getElementById("keyword")
  const getByTitle = getFromStorage().filter((data) => data.title.toLowerCase().indexOf(keyword.value.toLowerCase()) > -1)
  // const getByTitle = getFromStorage().filter((data) => data.title==keyword.value.trim())
  if (getByTitle.length == 0) {
    alert("Data yang anda cari tidak ditemukan")
    return location.reload()
  } else {
    showResult(getByTitle)
    countResult(getByTitle.length)
  }
}

function isComplete(x) {
  if (x) {
    return '<span class="complete">Selesai dibaca</span>'
  } else {
    return '<span class="incomplete">Belum selesai baca</span>'
  }
}

function showResult(books) {
  const searchResult = document.getElementById("search-result")
  searchResult.classList.add("result-list")

  const htmHeader = document.createElement("h3")
  htmHeader.innerText = "Hasil Pencarian :"

  const htmCountResult = document.createElement("p")
  htmCountResult.setAttribute("id", "count")
  htmCountResult.innerText = "Buku yang ditemukan sebanyak "

  searchResult.append(htmHeader, htmCountResult)

  books.forEach((book) => {
    const htmResult = document.createElement("div")
    htmResult.classList.add("result-item")
    searchResult.append(htmResult)

    const htmTitle = document.createElement("h2")
    htmTitle.innerText = book.title

    const htmAuthor = document.createElement("p")
    htmAuthor.innerText = "Penulis : " + book.author

    const htmYear = document.createElement("p")
    htmYear.innerText = "Tahun : " + book.year

    const htmDetail = document.createElement("p")
    htmDetail.innerHTML = "Keterangan : " + isComplete(book.isComplete)

    htmResult.append(htmTitle, htmAuthor, htmYear, htmDetail)
  })
}

const countResult = (countResult) => {
  const htmCountResult = document.getElementById('count')
  htmCountResult.innerText += " " + countResult+" buah"
}
