class CustomError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends CustomError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class DatabaseError extends CustomError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
  }
}

module.exports = {
  CustomError,
  ValidationError,
  NotFoundError,
  DatabaseError
};