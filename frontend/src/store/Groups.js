

const GET_GROUPS = '/Groups/GET_GROUPS';


const getGroups = (groups) => ({
    type: GET_GROUPS,
    groups
});


export const getGroupsThunk = () => async (dispatch) => {
    const response = await fetch('/api/groups');
    const data = await response.json();
    if (response.ok) dispatch(getGroups(data.Groups));
    return data;
};

const initialState = {};

export const groupReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_GROUPS: {
            const newObj = {};
            action.groups.forEach(group => newObj[group.id] = group)
            return newObj;
        }
        default:
            return state;
    }
}