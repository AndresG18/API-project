import { useParams } from 'react-router-dom';
import './GroupShow.css'
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getGroupThunk } from '../../store/Group';
// import { getGroupsThunk } from '../../store/Groups';
// import { useEffect } from 'react';
import { getEventsThunk } from '../../store/events';
import EventDetails from '../EventDetails';
import GroupDelete from '../GroupDelete';
import OpenModalButton from '../OpenModalButton';


function GroupShow() {
    const navigate = useNavigate();
    const [Delete,setDelete] = useState(false)
    const dispatch = useDispatch();
    const { groupId } = useParams();
    const user = useSelector(state => state.session.user)
    const currGroup = useSelector(state => state.currGroup)
    const image = currGroup?.GroupImages?.[0]?.url ?? null
    const events = useSelector(state => state.events)
    const eventsarr = Object.values(events).filter(event => event?.groupId === currGroup?.id)

    useEffect(() => {
        if(Delete) {
             navigate('/groups',{replace:true})
            }
    },[Delete,navigate])
    useEffect(() => {
        dispatch(getGroupThunk(groupId))
        dispatch(getEventsThunk())

    }, [dispatch, groupId])

    const handleClick = () => {
        window.alert("Feature Coming Soon")
    }
    const handleEvent = (e) => {
        e.preventDefault();
        navigate('/events/new')
    }
    const handleUpdate = (e) => {
        e.preventDefault();
        navigate(`/groups/${currGroup.id}/edit`)
    }
    const button = user && user.id !== currGroup?.organizerId ? (
        <button onClick={handleClick}>Join this Group</button>
    ) : (
        null
    );
    const crudButtons =  user?.id == currGroup?.organizerId ? (
        <div className="GroupCrud">
            <button onClick={handleEvent}>
                Create an event
            </button>
            <button onClick={handleUpdate}>
                Update
            </button>
            <OpenModalButton buttonText={'Delete'}  modalComponent={<GroupDelete setDelete={setDelete} group={currGroup} />}>
            </OpenModalButton>
        </div>
    ) : null;
    const groupdetails = currGroup.Organizer ? (<> <Link className='groupButton' to="/groups" > {'<'} Groups </Link>
        <div className='group-Info'>
            <div className='group-div'>
                <img src={image} alt="previewImage" />
                <ul>
                    <h2> {currGroup.name}</h2>
                    <li>Organizer: {currGroup.Organizer.firstName} {currGroup.Organizer.lastName}</li>
                    <li>Location: {currGroup.city}, {currGroup.state}</li>
                    <li>Events: {eventsarr.length} • {currGroup.private ? (<> Private</>) : (<> Public</>)} </li>
                    <li>Type : {currGroup.type} </li>
                </ul>
            </div>
            {crudButtons}
            <div className='about'>
                <h2>What we are about:</h2>
                <p>{currGroup.about}</p>
                {button}
                <h2>Events </h2>
                {eventsarr.map(event => (
                    <EventDetails key={event.id} event={event} />
                ))}
            </div>
        </div></>) : (<h1>...Loading</h1>)
    return (
        <>
            {groupdetails}
        </>
    )
}

export default GroupShow