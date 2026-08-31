// South African ID number helpers.
//
// A SA ID is exactly 13 digits and encodes the date of birth in the first six: YYMMDD.
// That lets us check an applicant's age without asking for it separately.

export const SA_ID_LENGTH = 13;

/**
 * Reads the date of birth out of an ID number.
 * Returns null when the leading six digits aren't a real calendar date.
 */
export function parseSaIdDateOfBirth(idNumber, today = new Date()) {
  const digits = String(idNumber ?? '').trim();
  if (!/^\d{13}$/.test(digits)) return null;

  const yy = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const day = Number(digits.slice(4, 6));

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  // Two digit years are ambiguous, so resolve them into the most recent past century:
  // anything that would land in the future belongs to the 1900s.
  const currentTwoDigitYear = today.getFullYear() % 100;
  const year = yy > currentTwoDigitYear ? 1900 + yy : 2000 + yy;

  const dob = new Date(year, month - 1, day);
  // Rejects impossible dates that JS would otherwise roll over (e.g. 31 February).
  if (dob.getFullYear() !== year || dob.getMonth() !== month - 1 || dob.getDate() !== day) {
    return null;
  }
  return dob;
}

/** Completed years between dob and today. */
export function calculateAge(dob, today = new Date()) {
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

/**
 * Validates an ID number for a given minimum age.
 * Returns an error message, or '' when the ID is acceptable.
 */
export function validateSaIdNumber(value, minAge, today = new Date()) {
  const raw = String(value ?? '').trim();

  if (!raw) return 'ID number is required';
  if (!/^\d+$/.test(raw)) return 'ID number must contain digits only';
  if (raw.length !== SA_ID_LENGTH) {
    return `ID number must be exactly ${SA_ID_LENGTH} digits (you entered ${raw.length})`;
  }

  const dob = parseSaIdDateOfBirth(raw, today);
  if (!dob) return 'That is not a valid ID number. The first 6 digits must be a real date of birth (YYMMDD)';

  const age = calculateAge(dob, today);
  if (age < minAge) {
    return `You must be older than ${minAge} to become a Local Guide. This ID belongs to someone aged ${age}`;
  }

  return '';
}
