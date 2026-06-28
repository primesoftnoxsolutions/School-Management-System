import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api/client";

const SESSION_STORAGE_KEY = "hasAuthSession";

const initialState = {
  user: null,
  loading: false,
  sessionChecked: false,
  error: null,
  justLoggedIn: false,
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const login = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const [{ data }] = await Promise.all([api.post("/auth/login", payload), wait(900)]);
    return data.data;
  } catch (error) {
    await wait(500);
    if (!error.response) {
      return rejectWithValue("Server unavailable. Check backend server.");
    }
    if ([400, 401, 403].includes(error.response.status)) {
      return rejectWithValue("Wrong login details");
    }
    return rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/me");
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Session expired");
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Logout failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.justLoggedIn = false;
      state.sessionChecked = true;
      localStorage.removeItem(SESSION_STORAGE_KEY);
    },
    clearJustLoggedIn(state) {
      state.justLoggedIn = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.justLoggedIn = true;
        state.sessionChecked = true;
        localStorage.setItem(SESSION_STORAGE_KEY, "true");
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionChecked = true;
        state.user = action.payload;
        localStorage.setItem(SESSION_STORAGE_KEY, "true");
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
        state.sessionChecked = true;
        state.user = null;
        localStorage.removeItem(SESSION_STORAGE_KEY);
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.error = null;
        state.justLoggedIn = false;
        state.sessionChecked = true;
        localStorage.removeItem(SESSION_STORAGE_KEY);
      });
  },
});

export const { logout, clearJustLoggedIn } = authSlice.actions;
export default authSlice.reducer;
