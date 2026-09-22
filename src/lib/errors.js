// Axios errors carry circular refs (request/config) and aren't plain
// objects, so Redux Toolkit's serializability check rejects them if passed
// to rejectWithValue as-is. Keep only what getErrorMessage() needs.
export const toSerializableError = (error) => ({
  message: error?.message,
  response: error?.response
    ? { status: error.response.status, data: error.response.data }
    : undefined,
})

export const getErrorMessage = (error) => {
  const payload = error?.response?.data

  if (!payload) {
    return "Немає з'єднання з сервером. Спробуйте ще раз."
  }

  const validationErrors = payload.data?.errors
  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors.map((item) => item.message).join(', ')
  }

  return payload.data?.message || payload.message || 'Сталася помилка.'
}
