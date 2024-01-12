// DUCKS pattern
import {createSlice} from '@reduxjs/toolkit';

const formationCounterSlice = createSlice({
    name: 'formationCounter',
    initialState: 0,
    reducers: {
        increment: state => state + 1,
        decrement: state => state - 1
    }
})