import './EventDetails.css'
import {useNavigate} from 'react-router-dom';


function EventDetails({event}){
    const start = event.startDate.substring(0,10)
    const time = event.startDate.slice(11,16)
    const navigate = useNavigate();
    const handleClick= (e)=>{
        e.preventDefault();
        navigate(`events/${event.id}`)
    }

  return (
    <div className="events" onClick={handleClick}>
        <img src={event.previewImage}  alt="previewImage" />
        <ul className='eventText'>
            <h2>{event.name}</h2>
            {event.Venue && <h3>{event.Venue.city}, {event.Venue.state} </h3>}
            <h3>{start} @ {time}</h3>
        </ul>
    </div>
  )
}

export default EventDetails