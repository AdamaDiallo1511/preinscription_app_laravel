'use strict'
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from './create-slice';
import btnReducer from './btn-slice';

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        btn: btnReducer
    }
});

export const selectCount = (state) => state.counter.value;