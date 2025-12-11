import { apiClient } from "@/lib/apiClient";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// GET /auth/me
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  // The async function that runs when we dispatch(fetchMe())
  // Createasync thunk automtically handles api request and updates state
  // thunkAPI = toolbox with dispatch, getState, rejectWithValue, etc.
  async (_, thunkAPI) => {
    try {
      const res = await apiClient.get("/auth/me");
      // If successful, the returned value becomes action.payload
      return res.data.data.user;
    } catch {
      // If request fails, send a controlled error value
      return thunkAPI.rejectWithValue(null);
    }
  }
);

// POST /auth/login
export const login = createAsyncThunk(
  "auth/login",
  async (payload, thunkAPI) => {
    try {
      const res = await apiClient.post("/auth/login", payload);
      return res.data.data.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Login failed"
      );
    }
  }
);

// POST /auth/signup
export const signup = createAsyncThunk(
  "auth/signup",
  async (payload, thunkAPI) => {
    try {
      const res = await apiClient.post("/auth/signup", payload);
      return { message: res.data.message, userId: res.data.data?.userId };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Signup failed"
      );
    }
  }
);

// POST /auth/logout
export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await apiClient.post("/auth/logout");
    return true;
  } catch (err) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || err.message || "Logout failed"
    );
  }
});

// POST /auth/google
export const googleAuth = createAsyncThunk(
  "auth/googleAuth",
  async (payload, thunkAPI) => {
    try {
      const res = await apiClient.post("/auth/google", payload);
      return res.data.data.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Google auth failed"
      );
    }
  }
);

// GET /auth/verify-email
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ token, id }, thunkAPI) => {
    try {
      const res = await apiClient.get(
        `/auth/verify-email?token=${encodeURIComponent(
          token
        )}&id=${encodeURIComponent(id)}`
      );
      return res.data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Verification failed"
      );
    }
  }
);

// POST /auth/resend-verification
export const resendVerification = createAsyncThunk(
  "auth/resendVerification",
  async (payload, thunkAPI) => {
    try {
      const res = await apiClient.post("/auth/resend-verification", payload);
      return {
        message: res.data.message,
        userId: res.data.data?.userId || null,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Resend failed"
      );
    }
  }
);

// POST /auth/forgot-password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (payload, thunkAPI) => {
    try {
      const res = await apiClient.post("/auth/forgot-password", payload);
      return res.data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Forgot password failed"
      );
    }
  }
);

// POST /auth/reset-password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, id, newPassword }, thunkAPI) => {
    try {
      const res = await apiClient.post(
        `/auth/reset-password?token=${encodeURIComponent(
          token
        )}&id=${encodeURIComponent(id)}`,
        { newPassword }
      );
      return res.data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Reset password failed"
      );
    }
  }
);

// PATCH /auth/me/username
export const updateUsername = createAsyncThunk(
  "auth/updateUsername",
  async (payload, thunkAPI) => {
    try {
      const res = await apiClient.patch("/auth/me/username", payload);
      return res.data.data.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Update username failed"
      );
    }
  }
);

// PATCH /auth/me/name
export const updateName = createAsyncThunk(
  "auth/updateName",
  async (payload, thunkAPI) => {
    try {
      const res = await apiClient.patch("/auth/me/name", payload);
      return res.data.data?.name;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Update name failed"
      );
    }
  }
);

// PATCH /auth/me/phone
export const updatePhone = createAsyncThunk(
  "auth/updatePhone",
  async (payload, thunkAPI) => {
    try {
      const res = await apiClient.patch("/auth/me/phone", payload);
      return res.data.data?.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Update phone failed"
      );
    }
  }
);

// PATCH /auth/me/password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (payload, thunkAPI) => {
    try {
      const res = await apiClient.patch("/auth/me/password", payload);
      return res.data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Change password failed"
      );
    }
  }
);

// DELETE /auth/me
export const deleteAccount = createAsyncThunk(
  "auth/deleteAccount",
  async (payload, thunkAPI) => {
    try {
      const res = await apiClient.delete("/auth/me", { data: payload });
      return res.data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Delete account failed"
      );
    }
  }
);

const initialState = {
  user: null,
  loading: false,
  error: null,
  signupInfo: null,
  lastMessage: null,
};

// ----------------------------------

// Slice = a section of Redux state + actions + reducers
const authSlice = createSlice({
  name: "auth",
  initialState, // default state

  // Synchronous reducers
  reducers: {
    clearError(state) {
      state.error = null; // remove error message
    },
    clearMessage(state) {
      state.lastMessage = null; // remove success message
    },
    setUser(state, action) {
      state.user = action.payload; // manually set user
    },
    clearUser(state) {
      state.user = null; // remove user
    },
  },

  // Handles async thunk actions (pending / fulfilled / rejected)
  extraReducers: (builder) => {
    // fetch-me

    builder
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
      });

    // login

    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // signup

    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.signupInfo = action.payload; // message + userId
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // logout

    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
    });

    // googleAuth

    builder
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.error = action.payload;
      });

    // verifyEmail

    builder
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.lastMessage = action.payload; // success message
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.error = action.payload;
      });

    // resendVerification

    builder
      .addCase(resendVerification.fulfilled, (state, action) => {
        state.signupInfo = action.payload; // new email verification message
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.error = action.payload;
      });

    // forgotPassword

    builder
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.lastMessage = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.error = action.payload;
      });

    // resetPassword

    builder
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.lastMessage = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.payload;
      });

    // updateUsername

    builder
      .addCase(updateUsername.fulfilled, (state, action) => {
        if (state.user) {
          state.user.username = action.payload.username;
        }
      })
      .addCase(updateUsername.rejected, (state, action) => {
        state.error = action.payload;
      });

    // updateName

    builder
      .addCase(updateName.fulfilled, (state, action) => {
        if (state.user) {
          state.user.name = action.payload;
        }
      })
      .addCase(updateName.rejected, (state, action) => {
        state.error = action.payload;
      });

    // updatePhone

    builder
      .addCase(updatePhone.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updatePhone.rejected, (state, action) => {
        state.error = action.payload;
      });

    // changePassword

    builder
      .addCase(changePassword.fulfilled, (state, action) => {
        state.lastMessage = action.payload;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload;
      });

    // deleteAccount

    builder
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// export reducer actions
export const { clearError, clearMessage, setUser, clearUser } =
  authSlice.actions;

export default authSlice.reducer;
