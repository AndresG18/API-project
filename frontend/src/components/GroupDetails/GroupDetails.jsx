import { useNavigate } from 'react-router-dom'
import './GroupDetails.css'
import { useDispatch, useSelector } from 'react-redux'
import { getGroupThunk } from '../../store/Group'
import { useEffect } from 'react'
import { getEventsThunk } from '../../store/events'

function GroupDetails({group}) {
    const navigate = useNavigate()
    const event = useSelector(state=> state.events)
    const events = Object.values(event).filter(e => e?.groupId === group?.id) 
    const dispatch = useDispatch();

    useEffect(()=>{
        dispatch(getEventsThunk())
    },[dispatch])
    const handleClick = async (e) =>{
        e.preventDefault();
        await dispatch(getGroupThunk(group.id))
        navigate(`/groups/${group.id}`)
    }
    const isPrivate = group?.private ? (
        <p>  {events?.length} Events  • Public </p>
    ):(
        <p>  {events?.length} Events • Private</p>
    )
  return (
    <>
    <div className='groupDiv' onClick={handleClick}>
        <div className='singleGroup'>
        <img src={group?.previewImage ?? null} alt="previewImage" />
        </div>
        <ul className='groupText'>
            <h2>{group?.name}</h2>
            <p>{group?.city}, {group?.state}</p>
            <p>{group?.about}</p>
            {isPrivate}
          
        </ul>
    </div>
    </>
  )
}

export default GroupDetails