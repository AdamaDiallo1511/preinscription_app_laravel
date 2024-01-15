'use strict'
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { store } from "./store";
import { incrementByAmount } from "./create-slice";

const userDataSubmission = createAsyncThunk(
    'btn/userDetailSubmission',
    async (userID, thunkAPI) => {
        const response1 = await fetch(`user-submission-detail/${userID}`, {
            method: 'GET',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'Content-Type':'application/json'
            },
        });
        const response2 = await fetch(`get-list-formation/`, {
            method: 'GET',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                'Content-Type':'application/json'
            },
        });
        if (!response1.ok || !response2.ok) {
            throw new Error('Network response was not ok');
        }
        const data1 = await response1.json();
        const data2 = await response2.json();
        return {data1, data2};
    }
)

const initialState = {
    userDetailSubmission: false,
    feedbackSubmission: false,
    documentSubmission: false,
    submitted: false,
    formationSelected: [],
    formationCandidaureID: [],
    listFormations : [],
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
        },
    },
    extraReducers: (builder) => {
        builder.addCase(userDataSubmission.fulfilled, (state, action) => {
            state.userDetailSubmission = action.payload.data1.validate_users_informations.validate_users_information === 0 ? false : true;
            state.feedbackSubmission = action.payload.data1.validate_feedback.validate_feedback === 0 ? false : true;
            state.documentSubmission = action.payload.data1.validate_users_documents.document === 0 ? false : true;
            state.submitted = action.payload.data1.candidatez_preinscriptions.candidated === 0 ? false : true;
            state.userPersonnalInformation = {...state.userPersonnalInformation, ...action.payload.data1.user_information};
            state.feedbackSubmissionData = {...state.feedbackSubmissionData, ...action.payload.data1.feedback};
            state.formationSelected = [...state.formationSelected, ...action.payload.data1.formations_selected.map(formation => formation.formation_id)];
            state.formationCandidaureID = [...state.formationCandidaureID, ...action.payload.data1.formations_selected];
            state.listFormations = [...state.listFormations, ...action.payload.data2]; // assuming data2 is an array
        })
    }
})

export async function fetchData (userID){return store.dispatch(userDataSubmission(userID))};
export function submittedUserData(){return {...store.getState().btn.userPersonnalInformation, ...store.getState().btn.feedbackSubmissionData}}
export async function formationSelectedcount(){return incrementByAmount(store.getState().btn.formationSelected.length)}
export function listFormationsSelected(){
    const allFormations = store.getState().btn.listFormations;
    const FormationsSelectedID = store.getState().btn.formationSelected;
    const arr = allFormations.filter(formation => FormationsSelectedID.includes(formation.id));
    const formationCandidaureID = store.getState().btn.formationCandidaureID;
    let newArr = arr.map(item => {
        let match = formationCandidaureID.find(f => f.formation_id === item.id);
        if (match) {
            return {...item, candidatureID: match.candidatureID};
        } else {
            return item;
        }
    });
    return newArr;
}

export const { userDetailSubmission, feedbackSubmission, documentSubmission, submitted, formationSelected } = btnSlice.actions;
export default btnSlice.reducer;
