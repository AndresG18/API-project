import { csrfFetch } from "./csrf";

const GET_EVENTS = 'Events/GET_EVENTS'
const GET_EVENT_ID = 'Events/GET_EVENT_ID'
const ADD_EVENT = 'Events/ADD_EVENT'
const EDIT_EVENT = 'Events/EDIT_EVENT'


const getEvents = (events) => ({
    type: GET_EVENTS,
    events
})
const getEventId = (event) => (
    {
        type: GET_EVENT_ID,
        event
    }
)
const addEvent = (events) => (
    {
        type: ADD_EVENT,
        events
    }
)
const editEvent = (event) => (
    {
        type: EDIT_EVENT,
        event
    }
)

export const getEventsThunk = () => async (dispatch) => {
    const response = await fetch('/api/events');
    const data = await response.json()
    if (response.ok) dispatch(getEvents(data.Events))
    return response
}

const initialState = {};

export const eventReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_EVENTS:
            const obj = {}
             action.events.forEach(event => obj[event.id] = event)
            return obj;
        default:
            return state;
    }

}