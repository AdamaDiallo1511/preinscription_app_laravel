'use strict'
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from './create-slice';
import btnReducer from './btn-slice';
import adminSlice from "./admin-slice";

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        btn: btnReducer,
        admin: adminSlice
    }
});

export const selectCount = (state) => state.counter.value;