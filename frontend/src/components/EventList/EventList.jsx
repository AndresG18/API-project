import { useSelector } from "react-redux"
import { GroupOrEvent } from "../GroupList/GroupList"
import EventDetails from '../EventDetails/index'
import './EventList.css'
function EventList() {
    const events = useSelector(state => state.events)
    const eventArr = Object.values(events)
    return (
        <>
            <div className="eventList" >
                <GroupOrEvent />
                <h2>Events in GatherX</h2>
                {eventArr.map(event => (
                    <EventDetails key={event.id} event={event} />
                ))}
            </div>
        </>
    )
}

export default EventList