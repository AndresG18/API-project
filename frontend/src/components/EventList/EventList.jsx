import { useSelector } from "react-redux"
import { GroupOrEvent } from "../GroupList/GroupList"
import EventDetails from "../EventDetails/EventDetails"
import './EventList.css'
function EventList() {
    const events = useSelector(state => state.events)
    const eventArr = Object.values(events)
    return (
        <>
            <div className="eventList" >
                <GroupOrEvent />
                {eventArr.map(event => (
                    <EventDetails key={event.id} event={event} />
                ))}
            </div>
        </>
    )
}

export default EventList