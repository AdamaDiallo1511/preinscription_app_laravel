import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submitData } from "./functions";
import { store } from "./store";
import { error } from "jquery";

const preinscriptionStatut = createAsyncThunk(
    'btn/statutPrecription',
    async (thunkAPI) => {
        const response = await fetch(`preinscriptions-list/`, {
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
        if (!response.ok || !response2) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const data2 = await response2.json();
        return {data, data2};
    }
)

const initialState = {
    preinscription_list: [],
    listFormation : []
}

const adminSlice = createSlice({
    name: 'admin',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(preinscriptionStatut.fulfilled, (state, action) => {
                state.preinscription_list = [...state.preinscription_list ,...action.payload.data]
                state.listFormation = [...state.listFormation ,...action.payload.data2]
            })
    }
})

export default adminSlice.reducer

export async function adminData() {
    await store.dispatch(preinscriptionStatut())
    const prelist = store.getState().admin.preinscription_list
    const listForm = store.getState().admin.listFormation
    const newArr = prelist.map(el => {
        const match = listForm.find(f => f.id === el.formation)
        if(match){
            return {...match, ...el}
        }else{
            return el
        }
    }) 
    console.log(prelist)
    console.log(listForm);
    console.log(newArr);
    return newArr.forEach(el => {
        if (el.departement == 'Genie-Informatique') {
            $('#admin-row-table-genie-informatique-section').append(
                `<tr data-FormationID="${el.document}" id='rowID-${el.preinscription}' data-preinscriptionID=${el.preinscription}>
                    <th scope="row">${el.preinscription}</th>
                    <td>${el.nom_formation}</td>
                    <td>${el.cycle}</td>
                    <td id='download-doc-parent-${el.preinscription}'><button id='download-doc-${el.preinscription}' data-document="${el.document}"> <i class='bi bi-arrow-down'> </button></td>
                    <td>
                        <button type="submit" class="btn btn-success" id="accepter-preinscription-${el.preinscription}" data-preinscriptionID='${el.preinscription}' ${el.statut != null ? 'disabled' : ''}>Accepter</button>
                        <button type="submit" class="btn btn-danger" id="refuser-preinscription-${el.preinscription}" data-preinscriptionID='${el.preinscription}' ${el.statut != null ? 'disabled' : ''}>Refuser</button>
                    </td>
                </tr>`
            )
        } else {
            $('#admin-row-table-reseau-system-section').append(
                `<tr data-document="${el.document}" id='rowID-${el.preinscription}' data-preinscriptionID=${el.preinscription}>
                    <th scope="row">${el.preinscription}</th>
                    <td>${el.nom_formation}</td>
                    <td>${el.cycle}</td>
                    <td id='download-doc-parent-${el.preinscription}'><button id='download-doc-${el.preinscription}' data-document="${el.document} data-preinscriptionID=${el.preinscription}"> <i class='bi bi-arrow-down'> </button></td>
                    <td>
                        <button type="submit" class="btn btn-success" id="accepter-preinscription-${el.preinscription}" data-preinscriptionID=${el.preinscription}>Accepter</button>
                        <button type="submit" class="btn btn-danger" id="refuser-preinscription-${el.preinscription}" data-preinscriptionID=${el.preinscription}>Refuser</button>
                    </td>
                </tr>`
            )
        }
        $(`#rowID-${el.preinscription}`).on('click', 'button[id^="accepter-preinscription-"]', async function () {
            console.log('cli')
            const data = {statut: 1}
            submitData(`confirme-preinscription/${el.statut_preinscriptions_id}`,data,'PUT').then(res => {
                console.log(res)
                if (res.success) {
                    $(`#accepter-preinscription-${el.preinscription}`).attr('disabled', 'disabled')
                    $(`#refuser-preinscription-${el.preinscription}`).attr('disabled', 'disabled')
                } else {
                    throw new error (
                        'request abborted'
                    )
                }
            }).catch(error => console.error(error))
        }); 
        $(`#rowID-${el.preinscription}`).on('click', 'button[id^="refuser-preinscription-"]', async function () {
            const data = {statut: 0}
            submitData(`confirme-preinscription/${el.statut_preinscriptions_id}`,data,'PUT').then(res => {
                console.log(res)
                if (res.success) {
                    $(`#accepter-preinscription-${el.preinscription}`).attr('disabled', 'disabled')
                    $(`#refuser-preinscription-${el.preinscription}`).attr('disabled', 'disabled')
                } else {
                    throw new error (
                        'request abborted'
                    )
                }
            }).catch(error => console.error(error))
        }); 
        $(`#download-doc-parent-${el.preinscription}`).on('click', 'button[id^="download-doc-"]', async function () {
            console.log(`${el.preinscription}`);
            // Add your download logic here
            const data = JSON.parse($(`#download-doc-${el.preinscription}`).attr('data-document'));

            console.log(data);
            window.location.href = `documents-download/${data.join(',')}`;

        }); 
    })
}


