'use strict'
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { store } from "./store";
import { incrementByAmount } from "./create-slice";

const userDataSubmission = createAsyncThunk(
    'btn/userDetailSubmission',
    async (userID, thunkAPI) => {
        const response = await fetch(`user-submission-detail/${userID}`, {
            method: 'GET',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'Content-Type':'application/json'
            },
        });
        const data = await response.json();
        return data;
    }
)

// Rest of the code remains the same


const initialState = {
    userDetailSubmission: false,
    feedbackSubmission: false,
    documentSubmission: false,
    submitted: false,
    formationSelected: [],
    feedbackSubmissionData : {},
    userPersonnalInformation : {},
}

const btnSlice = createSlice({
    name: 'btn',
    initialState: initialState,
    reducers: {
        userDetailSubmission: (state) => {
            state.userDetailSubmission = true
        },
        feedbackSubmission: (state) => {
            state.feedbackSubmission = true
        },
        documentSubmission: (state) => {
            state.documentSubmission = true
        },
        submitted: (state) => {
            state.submitted = true
        },
        formationSelected: (state, action) => {
            state.formationSelected = [action.payload, ...state.formationSelected]
        }
    },
    extraReducers: (builder) => {
        builder.addCase(userDataSubmission.fulfilled, (state, action) => {
            state.userDetailSubmission = action.payload.validate_users_informations.validate_users_information === 0 ? false : true;
            state.feedbackSubmission = action.payload.validate_feedback.validate_feedback === 0 ? false : true;
            state.documentSubmission = action.payload.validate_users_documents.document === 0 ? false : true;
            state.submitted = action.payload.candidatez_preinscriptions.candidated === 0 ? false : true;
           state.userPersonnalInformation = Object.assign(state.userPersonnalInformation ,action.payload.user_information);
           state.feedbackSubmissionData = Object.assign(state.feedbackSubmissionData ,action.payload.feedback);
           state.formationSelected = [...state.formationSelected , ...action.payload.formations_selected.map(formation => formation.formation)];
        })
    }
})

export async function fetchData (userID){return store.dispatch(userDataSubmission(userID))};
export function submittedUserData(){return Object.assign({} ,store.getState().btn.userPersonnalInformation, store.getState().btn.feedbackSubmissionData)}
export async function formationSelectedcount(){return incrementByAmount(store.getState().btn.formationSelected.length)}

export const { userDetailSubmission, feedbackSubmission, documentSubmission, submitted, formationSelected } = btnSlice.actions;
export default btnSlice.reducer;

