import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api/client";

const initialState = {
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  loading: false,
  error: null,
};

export const login = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    return data.data;
  } catch (error) {
    if (!error.response) {
      return rejectWithValue("Server unavailable. Check backend server.");
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

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem("accessToken");
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
        state.accessToken = action.payload.accessToken;
        localStorage.setItem("accessToken", action.payload.accessToken);
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
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        localStorage.removeItem("accessToken");
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
