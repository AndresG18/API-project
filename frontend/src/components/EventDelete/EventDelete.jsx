import './EventDelete.css'
import { useModal } from '../../context/Modal'
import { csrfFetch } from '../../store/csrf'

function EventDelete({props}) {
   const {closeModal} = useModal()
   const event = props.event
   const setRemoved = (props.setRemoved)
   console.log(event)
   const handleClick = (e)=>{
    e.preventDefault()
    csrfFetch(`/api/events/${event.id}`,
    {method:'DELETE'})
    .then(response=>{setRemoved(response.ok)})
    window.alert("Event was successfully deleted")
    closeModal()
}
  return (
    <div className='deleteModal'>
    <p>Are you sure you want to delete {event?.name ?? "this event"} ?</p>
    <button className='yes'onClick={(e)=>{handleClick(e)}}>Yes </button>
    <button className = 'no'onClick={closeModal}>Cancel</button>
</div>
  )
}

export default EventDelete