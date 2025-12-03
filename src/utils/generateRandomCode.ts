export const generateRandomCode = () => {
  // Generar 3 letras mayúsculas aleatorias
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetters = Array.from({ length: 3 }, () => 
    letters.charAt(Math.floor(Math.random() * letters.length))
  ).join('');

  // Generar 3 dígitos aleatorios (001-999)
  const randomNumber = Math.floor(Math.random() * 999) + 1;
  const formattedNumber = randomNumber.toString().padStart(3, '0');

  return `${randomLetters}-${formattedNumber}`;
};