// Middleware per validazione input
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 8;
};

const validateNickname = (nickname) => {
  return !nickname || (nickname.length >= 2 && nickname.length <= 30);
};

const validateAge = (age) => {
  return age >= 18 && age <= 100;
};

const validatePrice = (price) => {
  return price >= 0 && price <= 10000;
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

const validateAnnouncementInput = (data) => {
  const errors = [];
  
  if (!data.title || data.title.length < 3 || data.title.length > 100) {
    errors.push('Title must be between 3 and 100 characters');
  }
  
  if (!data.description || data.description.length < 10 || data.description.length > 2000) {
    errors.push('Description must be between 10 and 2000 characters');
  }
  
  if (data.age && !validateAge(data.age)) {
    errors.push('Age must be between 18 and 100');
  }
  
  if (data.price && !validatePrice(data.price)) {
    errors.push('Price must be positive and reasonable');
  }
  
  return errors;
};

const validateAuthInput = (data, isRegister = false) => {
  const errors = [];
  
  if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }
  
  if (isRegister && !validatePassword(data.password)) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (data.nickname && !validateNickname(data.nickname)) {
    errors.push('Nickname must be between 2 and 30 characters');
  }
  
  return errors;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateNickname,
  validateAge,
  validatePrice,
  sanitizeInput,
  validateAnnouncementInput,
  validateAuthInput
};
