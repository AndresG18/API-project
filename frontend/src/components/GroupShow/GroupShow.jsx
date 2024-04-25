// import { useParams } from 'react-router-dom';
import './GroupShow.css'
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
// import { getGroupThunk } from '../../store/Group';
// import { getGroupsThunk } from '../../store/Groups';
// import { useEffect } from 'react';
import { getEventsThunk } from '../../store/events';


function GroupShow() {
    const dispatch = useDispatch();
    // const {groupId} = useParams();
    const user = useSelector(state => state.session.user)
    const currGroup = useSelector(state => state.currGroup)
    const image = useSelector(state => state.currGroup.GroupImages[0].url)
    const events = useSelector(state => state.events)
    const eventsarr = Object.values(events)
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(getEventsThunk())
    }, [dispatch])
    // console.log(eventsarr)
    const handleClick = () =>{
        window.alert("Feature Coming Soon")
    }
    const handleEvent = (e)=>{
        e.preventDefault();
        navigate('/events/new')
    }
    const handleUpdate = (e)=>{
        e.preventDefault();
        navigate(`/groups/${currGroup.id}/edit`)
    }
    const button = user && user.id !== currGroup.organizerId ? (
        <button onClick={handleClick}>Join this Group</button>
    ) : (
        null
    );
    const crudButtons = user && user.id == currGroup.organizerId ? (
        <div className="GroupCrud">
            <button onClick={handleEvent}>
                Create an event
            </button>
            <button onClick={handleUpdate}>
                Update
            </button>
            <button>
                Delete 
            </button>
        </div>
    ):null;
    return (
        <>
            <Link className='groupButton' to="/groups" > {'<'} Groups </Link>
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
                </div>
            </div>
        </>
    )
}

export default GroupShow