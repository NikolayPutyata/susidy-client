import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  fetchMe,
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
} from '../api/auth.js'
import { setAccessToken } from '../api/client.js'
import { toSerializableError } from '../lib/errors.js'

// Щоб захардкодити юзера для верстки без бекенду — заповни цей об'єкт
// (форма як у GET /auth/me) і постав initializing: false нижче.
// const initialUser = { _id: '1', name: 'Тест', phoneNumber: '0991234567', role: 'admin', discount: 10 }
const initialUser = null

// Якщо initialUser заповнений — це значить розробник свідомо захардкодив
// юзера для верстки, і App.jsx не повинен одразу перетирати його спробою
// звернутись до реального бекенду.
export const hasHardcodedUser = initialUser !== null

const initialState = {
  user: initialUser,
  initializing: initialUser === null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

export const restoreSession = createAsyncThunk(
  'user/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const { accessToken } = await refreshRequest()
      setAccessToken(accessToken)
      return await fetchMe()
    } catch (err) {
      setAccessToken(null)
      return rejectWithValue(toSerializableError(err))
    }
  },
)

export const login = createAsyncThunk(
  'user/login',
  async (payload, { getState, rejectWithValue }) => {
    try {
      // Carrying session_id lets the server merge whatever guest cart
      // this browser had into the account being logged into.
      const { accessToken } = await loginRequest({
        ...payload,
        session_id: getState().cart.sessionId,
      })
      setAccessToken(accessToken)
      return await fetchMe()
    } catch (err) {
      return rejectWithValue(toSerializableError(err))
    }
  },
)

export const registerUser = createAsyncThunk(
  'user/register',
  async (payload, { rejectWithValue }) => {
    try {
      return await registerRequest(payload)
    } catch (err) {
      return rejectWithValue(toSerializableError(err))
    }
  },
)

export const logout = createAsyncThunk('user/logout', async () => {
  // Always clear local session state, even if telling the server about it
  // fails (offline, server down) — the user still expects to be logged
  // out on their end, and the access token is dropped either way.
  try {
    await logoutRequest()
  } catch (err) {
    console.error('Failed to notify server of logout', err)
  } finally {
    setAccessToken(null)
  }
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Пряме встановлення юзера без запиту на сервер — зручно для верстки/демо.
    setUser(state, action) {
      state.user = action.payload
      state.initializing = false
    },
    clearUser(state) {
      state.user = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        state.initializing = false
      })
      .addCase(restoreSession.rejected, (state) => {
        state.status = 'idle'
        state.user = null
        state.initializing = false
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer

export const selectUser = (state) => state.user.user
export const selectIsAuthenticated = (state) => !!state.user.user
export const selectIsAdmin = (state) => state.user.user?.role === 'admin'
export const selectAuthInitializing = (state) => state.user.initializing
