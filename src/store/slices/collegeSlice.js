import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collegeService } from '../../services/collegeService';

// Async thunks for colleges
export const fetchColleges = createAsyncThunk(
  'colleges/fetchColleges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await collegeService.getAllColleges();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchCollegeById = createAsyncThunk(
  'colleges/fetchCollegeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await collegeService.getCollegeById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createCollege = createAsyncThunk(
  'colleges/createCollege',
  async (collegeData, { rejectWithValue }) => {
    try {
      const response = await collegeService.createCollege(collegeData);
      return response.college;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateCollege = createAsyncThunk(
  'colleges/updateCollege',
  async ({ id, collegeData }, { rejectWithValue }) => {
    try {
      const response = await collegeService.updateCollege(id, collegeData);
      return response.college;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteCollege = createAsyncThunk(
  'colleges/deleteCollege',
  async (id, { rejectWithValue }) => {
    try {
      await collegeService.deleteCollege(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  colleges: [],
  selectedCollege: null,
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false
};

const collegeSlice = createSlice({
  name: 'colleges',
  initialState,
  reducers: {
    setSelectedCollege: (state, action) => {
      state.selectedCollege = action.payload;
    },
    clearSelectedCollege: (state) => {
      state.selectedCollege = null;
    },
    clearCollegesError: (state) => {
      state.error = null;
    },
    resetColleges: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchColleges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchColleges.fulfilled, (state, action) => {
        state.loading = false;
        state.colleges = action.payload;
      })
      .addCase(fetchColleges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCollegeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollegeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCollege = action.payload;
      })
      .addCase(fetchCollegeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCollege.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createCollege.fulfilled, (state, action) => {
        state.createLoading = false;
        state.colleges.push(action.payload);
      })
      .addCase(createCollege.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCollege.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateCollege.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.colleges.findIndex(college => college.collegeId === action.payload.collegeId);
        if (index !== -1) {
          state.colleges[index] = action.payload;
        }
        if (state.selectedCollege?.collegeId === action.payload.collegeId) {
          state.selectedCollege = action.payload;
        }
      })
      .addCase(updateCollege.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteCollege.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteCollege.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.colleges = state.colleges.filter(college => college.collegeId !== action.payload);
        if (state.selectedCollege?.collegeId === action.payload) {
          state.selectedCollege = null;
        }
      })
      .addCase(deleteCollege.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  }
});

export const { setSelectedCollege, clearSelectedCollege, clearCollegesError, resetColleges } = collegeSlice.actions;
export default collegeSlice.reducer;

