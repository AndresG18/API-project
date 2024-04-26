// import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import './EventShow.css'
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { useEffect } from 'react';
import { getEventIdThunk } from '../../store/Event';
// import { getEventsThunk } from '../../store/events';
import { getGroupThunk } from '../../store/Group';
import { TbZoomMoney } from "react-icons/tb";
import { FaClock } from "react-icons/fa";
import { BiMapPin } from "react-icons/bi";
import GroupDetails from '../GroupDetails';
import { getGroupsThunk } from '../../store/Groups';
useNavigate
function EventShow() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const [Delete, setDelete] = useState(false)
    const eventsClick = (e) => {
        e.preventDefault();
        navigate('/events')
    }
    const user = useSelector(state => state.session.user)
    const group = useSelector(state => state.currGroup)
    const event = useSelector(state => state.currEvent.event)
    const groupId = event?.groupId || null
    const image = event?.EventImages?.[0]?.url ?? null
    const start = event?.startDate?.substring(0, 10)
    const time = event?.startDate?.substring(11, 16)
    const end = event?.endDate?.substring(0, 10)
    const endTime = event?.endDate?.substring(11, 16)
    const events = useSelector(state => state.events);
    const groupProp = useSelector(state => state.groups[groupId])

    // useEffect(() => {
    //     if (Delete) {
    //         navigate('/groups', { replace: true })
    //     }
    // }, [Delete, navigate])
    useEffect(() => {
        dispatch(getEventIdThunk(eventId))
        if (groupId) {
            dispatch(getGroupThunk(groupId))
        }
        dispatch(getGroupsThunk())
    }, [dispatch, groupId, eventId])

    const eventCrud = user && user.id == group.organizerId ? (
        <div className='eventUD'>
            <button>Update</button>
            <button>Delete</button>
        </div>) : (<></>)
    const eventdetails = event?.groupId ? group.Organizer && (<div className='event-info'>
        <img src={image} alt="" />
        <div className='event-text'>
            <h2 style={{ margin: "0px",fontSize :"35px" }} >{event.name}</h2>
            <p style={{ margin: "8px" ,fontSize:"20px"}} className='organizerName'> - Hosted by {group.Organizer.firstName} {group.Organizer.lastName}</p>
            <div className='time'>
                <FaClock />
                <div>
                    <p> Start: {start} @ {time} </p>
                    <p> End: {end} @ {endTime} </p>
                </div>
            </div>
            <div className='price'>
                {event.price > 0 ? (<><TbZoomMoney /><p> {event.price}$</p></>) : (<><TbZoomMoney /> FREE</>)}
            </div>
            <div className='type'>
                <><BiMapPin /> <p>{event.type}</p></>
            </div>
        </div>
    </div>) : (<h1>...Loading</h1>)
    return (
        <div>
            <button onClick={eventsClick}>Events</button>
            {eventdetails}
            {eventCrud}
            <div>
                <p style={{fontSize:"30px",borderBottom:"2px solid rgb(59,59,59",width:"765px"}}>Description</p>
                {<p style={{fontSize:"21px"}}>{event.description} </p>}
            </div>
            {<div className='groupBox'>
                <p className='group-title'>Group</p>
                <GroupDetails group={groupProp} event={events} />
            </div>}
        </div>
    )
}

export default EventShow