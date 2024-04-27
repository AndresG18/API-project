import { useNavigate, useParams } from 'react-router-dom'
import './EventForm.css'
import { useEffect, useState } from 'react';
import { addEventThunk, editEventThunk } from '../../store/Event';
import DateTime from 'react-datetime';
import { useDispatch } from 'react-redux';
import { csrfFetch } from '../../store/csrf';

function EventForm({ props }) {
  const event = props?.event ?? {};
  const {groupId} = useParams();
  const [name, setName] = useState(event?.name ?? '');
  const [type, setType] = useState(event?.type ?? '');
  const [price, setPrice] = useState(event?.price ?? 0);
  const [start, setStart] = useState(event?.startDate ?? '');
  const [description, setDescription] = useState(event?.description ?? '')
  const [end, setEnd] = useState(event?.endDate ?? '');
  const [url, setUrl] = useState(event?.EventImages?.[0]?.url ?? '');
  const [err, setErr] = useState({});
  const [isErr, setIsErr] = useState(false)
  const [capacity, setCapacity] = useState(0)
  const navigate = useNavigate()
  const dispatch = useDispatch();

  useEffect(() => {
    const errors = {}
    if (!name.trim()) errors.name = "Name is required"
    if (!type) errors.type = "Type is required"
    if (new Date(start) == "Invalid Date") errors.startDate = "StartDate is required"
    if (new Date(end) == "Invalid Date") errors.endDate = "EndDate is required"
    if (new Date(end) <= new Date(start)) errors.endDate = "EndDate must be after startDate"
    if (Date.now() > (new Date(end) || new Date(start))) errors.endDate = "Event cannot take place in the past"
    if (isNaN(capacity)) errors.capacity = "capacity must be a number"
    if (isNaN(price)) errors.price = "price must be a number"
    if (description.length < 30) errors.description = "Description needs 30 or more characters"
    if (!['png', 'jpeg', 'jpg'].includes((url.trim().split(".")[1]))) errors.url = "URL needs to end in png, jpeg or jpg "
    setErr(errors)
  }, [capacity, name, type, price, start, end, url, description])

  const createEventImage = async (eventId, img) => {
    // Create new image for event
    const response = await csrfFetch(`/api/events/${eventId}/images`, {
      method: "POST",
      body: JSON.stringify(img)
    });
    const data = await response.json();
    return data;
  }
  const deleteImage = async (event)=>{
    if (event?.EventImages?.[0]?.id) {
      // If updating event, delete the existing image
      const response =await csrfFetch(`/api/event-images/${1}`, {
        method: "DELETE"
      });
      const data = await response.json()
      return data
    }
  }
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsErr(false)
    if (Object.values(err).length > 1) setIsErr(true)
    const req = {
      venueId: 1,
      groupId:groupId,
      name:name,
      type:type,
      description:description,
      price : price,
      capacity : capacity,
      startDate: start.toISOString(), // Convert Date to ISO 8601 string
      endDate: end.toISOString()  
    }
  
    const img = {
      url: url,
      preview: true
    }
    try {
      const data = event?.id ? await dispatch(editEventThunk(event?.id, req))
        : await dispatch(addEventThunk(groupId,req));
      event?.groupId? await deleteImage(event) :
      await createEventImage(data?.id, img)
      navigate(`/events/${data?.id}`)
    } catch (e) {
      console.log(e)
    }
  }
  return (
    <>
      <h1>{event?.id ? "updateGroup" : "Create a new event"}</h1>
      <form>
        <div className='form-section event-name'>
          <h3>{"What is the name of your event?"}</h3>
          <input value={name} onChange={(e) => { setName(e.target.value) }} placeholder="Event Name" type="text" />
        </div>
        {isErr && <p className='err' >{err.name}</p>}
        <div className='form-section'>
          <h3>{"Is this an in person or online Event?"} </h3>
          <select name="" id="" value={type} onChange={(e) => { setType(e.target.value) }}>
            <option disabled={true} value="">Select an event type</option>
            <option value="In person">In person</option>
            <option value="Online">Online</option>
          </select>
        </div>
        {isErr && <p className='err' >{err.type} </p>}
        <div className='form-section'>
          <div className='time-input'>
            <div className='form-section'>
              <h3>When does your event start?</h3>
              <DateTime
                className='dateTime'
                value={start}
                onChange={(value) => setStart(value)}
                inputProps={{ placeholder: "MM/DD/YYYY, HH:MM AM/PM" }}
              />
            </div>
            {isErr && <p className='err' >{err.startDate} </p>}
            <div className='form-section'>
              <h3>When does your event end?</h3>
              <DateTime
                value={end}
                onChange={(value) => setEnd(value)}
                inputProps={{ placeholder: "MM/DD/YYYY, HH:MM AM/PM" }}
              />
            </div>
          </div>
          {isErr && <p className='err' >{err.endDate} </p>}
        </div>
        <div className='form-section'>
          <h3> {"Please add an image url for your event below"}</h3>
          <input type="text" placeholder='image URL' value={url} onChange={(e) => { setUrl(e.target.value) }} />
        </div>
        {isErr && <p className='err' >{err.url} </p>}
        <div className='form-section'>
          <h3> {"What is the capacity for your event?"}</h3>
          <input type="text" placeholder='0' value={capacity} onChange={(e) => { setCapacity(e.target.value) }} />
        </div>
        {isErr && <p className='err' >{err.capacity} </p>}
        <div className='form-section'>
          <h3> {"What is the price for your event?"}</h3>
          <input type="text" placeholder='0' value={price} onChange={(e) => { setPrice(e.target.value) }} />
        </div>
        {isErr && <p className='err' >{err.price} </p>}
        <div className='form-section'>
          <h3> {"Please describe your event"} </h3>
          <textarea value={description} placeholder='Please include at least 30 characters' onChange={(e) => setDescription(e.target.value)} />
        </div>
        {isErr && <p className='err' >{err.description} </p>}
        <button onClick={handleSubmit} >
          {event?.id ? "Update Event" : "Create Event"}
        </button>
      </form>
    </>
  )
}

export default EventForm