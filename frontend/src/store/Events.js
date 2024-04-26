

const GET_EVENTS = 'Events/GET_EVENTS'

const getEvents = (events) => ({
    type: GET_EVENTS,
    events
})


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
           { const obj = {}
             action.events.forEach(event => obj[event.id] = event)
            return obj}
        default:
            return state;
    }

}