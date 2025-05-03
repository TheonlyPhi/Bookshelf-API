const fs = require('fs');
const { nanoid } = require('nanoid');
const path = require('path');

const filePath = path.join(__dirname, 'books.json');

const readBooks = () => {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf-8');
  return data ? JSON.parse(data) : [];
};

const writeBooks = (books) => {
  fs.writeFileSync(filePath, JSON.stringify(books, null, 2));
};

const routes = [
    {
        method: 'GET',
        path: '/',
        handler: () => ({
          status: 'success',
          message: 'Bookshelf API is running',
        }),
      },
  {
    method: 'POST',
    path: '/books',
    handler: (request, h) => {
      const {
        name, year, author, summary, publisher,
        pageCount, readPage, reading,
      } = request.payload;

      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
      }

      const id = nanoid(16);
      const insertedAt = new Date().toISOString();
      const updatedAt = insertedAt;
      const finished = pageCount === readPage;

      const newBook = {
        id, name, year, author, summary, publisher,
        pageCount, readPage, finished, reading,
        insertedAt, updatedAt,
      };

      const books = readBooks();
      books.push(newBook);
      writeBooks(books);

      return h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      }).code(201);
    },
  },
  {
    method: 'GET',
    path: '/books',
    handler: (request, h) => {
      const books = readBooks();
      const list = books.map(({ id, name, publisher }) => ({ id, name, publisher }));
      return h.response({
        status: 'success',
        data: {
          books: list,
        },
      });
    },
  },
  {
    method: 'GET',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const books = readBooks();
      const book = books.find((b) => b.id === bookId);

      if (!book) {
        return h.response({
          status: 'fail',
          message: 'Buku tidak ditemukan',
        }).code(404);
      }

      return h.response({
        status: 'success',
        data: {
          book,
        },
      });
    },
  },
  {
    method: 'PUT',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const {
        name, year, author, summary, publisher,
        pageCount, readPage, reading,
      } = request.payload;

      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Mohon isi nama buku',
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
      }

      const books = readBooks();
      const index = books.findIndex((b) => b.id === bookId);

      if (index === -1) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Id tidak ditemukan',
        }).code(404);
      }

      books[index] = {
        ...books[index],
        name, year, author, summary, publisher,
        pageCount, readPage, reading,
        finished: pageCount === readPage,
        updatedAt: new Date().toISOString(),
      };

      writeBooks(books);

      return h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      });
    },
  },
  {
    method: 'DELETE',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const books = readBooks();
      const index = books.findIndex((b) => b.id === bookId);

      if (index === -1) {
        return h.response({
          status: 'fail',
          message: 'Buku gagal dihapus. Id tidak ditemukan',
        }).code(404);
      }

      books.splice(index, 1);
      writeBooks(books);

      return h.response({
        status: 'success',
        message: 'Buku berhasil dihapus',
      });
    },
  },
];

module.exports = routes;
