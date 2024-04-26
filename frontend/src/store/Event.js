import { csrfFetch } from "./csrf"

const GET_EVENT_ID = 'Events/GET_EVENT_ID'
const ADD_EVENT = 'Events/ADD_EVENT'
const EDIT_EVENT = 'Events/EDIT_EVENT'

const getEventId = (event) => (
    {
        type: GET_EVENT_ID,
        event
    }
)
const addEvent = (event) => (
    {
        type: ADD_EVENT,
        event
    }
)
const editEvent = (event) => (
    {
        type: EDIT_EVENT,
        event
    }
)

export const getEventIdThunk = (eventId) => async (dispatch) => {
    const response = await fetch(`/api/events/${eventId}`);
    const data = await response.json();
    if (response.ok) dispatch(getEventId(data));
    return data
};

export const addEventThunk = (event) => async (dispatch) => {
    const response = await csrfFetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(event)
    });
    const data = await response.json();
    if (response.ok) dispatch(addEvent(data));
    return data
};

export const editEventThunk = (eventId, event) => async (dispatch) => {
    const response = await csrfFetch(`/api/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(event)
    });
    const data = await response.json();
    if (response.ok) dispatch(editEvent(data));
    return data
};

const initialState = {}

const eventIdReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_EVENT_ID:{
            const event = action.event
            return { ...state, event }}
        default:
            return state;
    }
};

export default eventIdReducer;