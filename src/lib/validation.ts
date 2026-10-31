// Form rules shared by the server actions. Each returns friendly messages keyed by field name;
// an empty object means the input is fine.

export type FieldErrors = Partial<Record<string, string>>;

export function hasErrors(errors: FieldErrors) {
  return Object.keys(errors).length > 0;
}

type BookInput = {
  title: string;
  publication_year: number | null;
  total_pages: number | null;
};

export function validateBook(book: BookInput, thisYear = new Date().getFullYear()): FieldErrors {
  const errors: FieldErrors = {};

  if (!book.title.trim()) errors.title = "Please give the book a title.";

  if (book.publication_year !== null) {
    if (!Number.isInteger(book.publication_year) || book.publication_year < 0 || book.publication_year > thisYear + 1) {
      errors.publication_year = `Enter a year between 0 and ${thisYear + 1}.`;
    }
  }

  if (book.total_pages !== null && (!Number.isInteger(book.total_pages) || book.total_pages < 1)) {
    errors.total_pages = "Total pages should be a whole number above 0.";
  }

  return errors;
}

type SessionInput = {
  bookId: string;
  sessionDate: string;
  startPage: number | null;
  endPage: number | null;
  totalPages: number | null;
};

export function validateSession(session: SessionInput, today: string): FieldErrors {
  const errors: FieldErrors = {};
  const { startPage, endPage, totalPages } = session;

  if (!session.bookId) errors.book_id = "Please choose which book you read.";

  if (!session.sessionDate) errors.session_date = "Please pick the day you read.";
  // Allow one day ahead: the reader's local "today" can be the server's tomorrow
  else if (session.sessionDate > nextDay(today)) errors.session_date = "That date is in the future.";

  if (startPage === null) errors.start_page = "Enter the page you started on.";
  else if (!Number.isInteger(startPage) || startPage < 1) errors.start_page = "Pages start at 1.";

  if (endPage === null) errors.end_page = "Enter the page you stopped on.";
  else if (!Number.isInteger(endPage) || endPage < 1) errors.end_page = "Pages start at 1.";
  else if (startPage !== null && endPage < startPage) {
    errors.end_page = `The end page can't be before the start page (${startPage}).`;
  } else if (totalPages !== null && endPage > totalPages) {
    errors.end_page = `This book only has ${totalPages} pages.`;
  }

  return errors;
}

function nextDay(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
