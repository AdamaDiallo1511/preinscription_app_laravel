'use strict'
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { store } from "./store";
import { incrementByAmount } from "./create-slice";
import { submitData, disableUserInformationForm } from "./functions";
import { data } from "jquery";

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
    document_id : [],
    userDetailSubmission: false,
    feedbackSubmission: false,
    documentSubmission: false,
    submitted: false,
    formationSelected: [],
    formationCandidaureID: [],
    listFormations : [],
    feedbackSubmissionData : {},
    userPersonnalInformation : {},
    statutPreinscription : []
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
        document_id: (state, action) => {
            state.document_id = [action.payload, ...state.document_id]
        },
    },
    extraReducers: (builder) => {
        builder.addCase(userDataSubmission.fulfilled, (state, action) => {
            state.userDetailSubmission = action.payload.data1.validate_users_informations.validate_users_information == 1 ? true : false;
            state.feedbackSubmission = action.payload.data1.validate_feedback.validate_feedback == 1 ? true : false;
            state.documentSubmission = action.payload.data1.validate_users_documents.document == 1 ? true : false;
            state.submitted = action.payload.data1.candidatez_preinscriptions.candidated == 1 ? true : false;
            state.userPersonnalInformation = {...state.userPersonnalInformation, ...action.payload.data1.user_information};
            state.feedbackSubmissionData = {...state.feedbackSubmissionData, ...action.payload.data1.feedback};
            state.formationSelected = [...state.formationSelected, ...Array.from(new Set(action.payload.data1.formations_selected.map(formation => formation.formation_id)))];
            state.formationCandidaureID = [...state.formationCandidaureID, ...action.payload.data1.formations_selected];
            state.document_id = [...state.document_id, ...action.payload.data1.document_id];
            state.statutPreinscription = [...state.statutPreinscription, ...action.payload.data1.preinscription_statut];
            state.listFormations = [...state.listFormations, ...action.payload.data2]; // assuming data2 is an array
        })
    }
})

export async function fetchData (userID){return store.dispatch(userDataSubmission(userID))};
export function submittedUserData(){return {...store.getState().btn.userPersonnalInformation, ...store.getState().btn.feedbackSubmissionData}}
export async function formationSelectedcount(){return incrementByAmount(store.getState().btn.formationSelected.length)}
export function listFormationsSelected(){
    const allFormations = store.getState().btn.listFormations;
    const formationsSelectedID = store.getState().btn.formationSelected;
    const arr = allFormations.filter(formation => formationsSelectedID.includes(formation.id));
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

export function ableBtnCandidate() {
    const userDetailSubmission = store.getState().btn.userDetailSubmission
    const feedbackSubmission = store.getState().btn.feedbackSubmission
    const documentSubmission = store.getState().btn.documentSubmission
    return userDetailSubmission && feedbackSubmission && documentSubmission ? true : false
}

export async function submitPreinscription(){
    const formationsSelectedID = store.getState().btn.formationSelected;
    const userData = {
        ...store.getState().btn.userPersonnalInformation,
        ...store.getState().btn.feedbackSubmissionData,
    } 
    const userID = userData.user_id
    const feedbackID = userData.feedback_id
    const documentID = store.getState().btn.document_id.map(document => document.document_id);
    console.log(documentID)
    const response1 = submitData(`validate-candidature/${userID}`, {candidated: 1}, 'PUT').then(async function(res) {
        console.log(res);
        if (res.success) {
            formationsSelectedID.forEach(async (formation) => {
               const create_at =  new Date()
                const data = {
                    user: userID,
                    formation: formation,
                    feedback: feedbackID,
                    document: documentID,
                    created_at: create_at
                }
               await submitData(`submit-candidature/`, data, 'POST').then(res =>{
                   console.log(res);
               }).catch(err => console.log(err))
           })
           await fetchData(userID);
           appendResponseCandidature()
         } else {
            throw new Error('Failed to candidate');
         }
        })
    .catch(err => console.log(err))
    return response1
}

export function appendResponseCandidature() {
    const listFormationSelected = listFormationsSelected();
    console.log(listFormationSelected);
    const preinscription = store.getState().btn.statutPreinscription;
    let arr = preinscription.map(el => {
        let match = listFormationSelected.find(f => f.id === el.formation)
        if (match) {
            return {...el, ...match}
        } else {
            return el;
        }
    })
    console.log(arr);
    arr.forEach( el => {
        $('#response-row-table').append(
            `<tr>
                <th scope="row">${el.id}</th>
                <td>${el.nom_formation}</td>
                <td>${el.cycle}</td>
                <td>${el.departement}</td>
                <td>${el.cout_formation}</td>
                <td>
                    <span class="${el.statut == null ? 'text-secondary fst-italic' : el.statut > 0 ? 'text-success' : 'text-danger'}">${el.statut == null ? 'En attente' : el.statut > 0 ? 'Accepte' : 'Refuse'}</span>
                </td>
            </tr>`
        )
        
    })
}
export const { userDetailSubmission, feedbackSubmission, documentSubmission, submitted, formationSelected, document_id } = btnSlice.actions;
export default btnSlice.reducer;
export function btnClicked() {
    const user = store.getState().btn.userDetailSubmission
    const feedback = store.getState().btn.feedbackSubmission
    const document = store.getState().btn.documentSubmission
    console.log(user, feedback, document)
    if (user) {
        const userPersonnalInformations = store.getState().btn.userPersonnalInformation
        $('#surname').val(userPersonnalInformations.surname);
        $('#phone_number').val(userPersonnalInformations.phone_number);
        $('#country').val(userPersonnalInformations.country);
        $('#province').val(userPersonnalInformations.province);
        $('#city_of_birth').val(userPersonnalInformations.city_of_birth);
        $('#sex').val(userPersonnalInformations.sex);    
        disableUserInformationForm();
    } 
     if (feedback) {
        const feedbackSubmited = store.getState().btn.feedbackSubmissionData
        $('#user-feedback').val(feedbackSubmited.feedback);
        $('#user-feedback').attr('disabled', 'disabled');
        $('#btn-submit-feedback').attr('disabled', 'disabled');
    } 
     if(document){
        $('#document-accordion').addClass('d-none');
    }
}
