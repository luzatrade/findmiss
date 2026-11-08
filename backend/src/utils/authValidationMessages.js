const AUTH_VALIDATION_IT = {
  'Invalid email format': 'Inserisci un indirizzo email valido',
  'Password must be at least 8 characters long': 'La password deve avere almeno 8 caratteri',
  'Nickname must be between 2 and 30 characters':
    'Il nome utente deve essere tra 2 e 30 caratteri',
  'Nickname is required': 'Inserisci un nome utente',
};

function mapAuthValidationErrors(details) {
  if (!Array.isArray(details) || details.length === 0) {
    return 'Dati non validi. Controlla i campi e riprova.';
  }
  const messages = details.map((key) => AUTH_VALIDATION_IT[key] || key);
  return messages.join(' ');
}

module.exports = { mapAuthValidationErrors };
