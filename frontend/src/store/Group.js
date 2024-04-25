import { csrfFetch } from "./csrf";

const CREATE_GROUP = '/Groups/GROUP_CREATE';
const GET_GROUP_ID = '/Groups/GET_GROUP_ID'
const UPDATE_GROUP = '/Groups/GROUP_UPDATE';

const addGroup = (group) => ({
    type: CREATE_GROUP,
    group
});
const getGroupById = (group) => ({
    type: GET_GROUP_ID,
    group
});
const updateGroup = (group) => ({
    type: UPDATE_GROUP,
    group
});


export const createGroupThunk = (group) => async (dispatch) => {
    const response = await csrfFetch('/api/groups', {
        method: "POST",
        body: JSON.stringify(group)
    });
    const data = await response.json();
    if (response.ok) dispatch(addGroup(data));
    return response;
};

export const getGroupThunk = (groupId) => async (dispatch) => {
    const response = await fetch(`/api/groups/${groupId}`);
    const data = await response.json();
    if (response.ok) dispatch(getGroupById(data));
    return data;
}
export const editGroupThunk = (group, groupId) => async (dispatch) => {
    const response = await csrfFetch(`/api/groups/${groupId}`, {
        method: "POST",
        body: JSON.stringify(group)
    });
    const data = await response.json();
    if (response.ok) dispatch(updateGroup(data));
    return response;
}

const initialState = {};

export const groupIdReducer = (state = initialState, action) => {
    switch (action.type) {
        case CREATE_GROUP:
        case UPDATE_GROUP:
        case GET_GROUP_ID:
            {
                const group = action.group;
                return group
            }
        default:
            return state;
    }
}