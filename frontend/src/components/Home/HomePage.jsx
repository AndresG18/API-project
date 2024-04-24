import { Link } from 'react-router-dom'
import './HomePage.css'
import { useSelector } from 'react-redux'

export default function HomePage() {
  const eventImage = "https://img-cdn.pixlr.com/image-generator/history/6626effc9ed75f6255bbcd0d/36f577f6-8226-4377-b9f2-285a97763231/medium.webp"
  const groupImage = "https://as1.ftcdn.net/v2/jpg/02/87/38/58/1000_F_287385828_ejLYE0aDPELQPOzEgEINOfr2M201c3E6.jpg"
  const sessionUser = useSelector(state=>state.session.user)
  const loggedIn = sessionUser ? (
    <></>
  ):(
    <div className='Join'>
    <button><Link  style={{ textDecorationLine: "none" }}>Join GatherX</Link></button>
  </div>
  )

  return (
    <div>
      <div className='introduction'>
        <h1>Discover new friends who share your interests </h1>
        <p>-Whether you're into hiking, reading, networking, or skill-sharing, there's a vibrant community waiting for you. With events taking place daily, there's always something exciting to join. Sign up now and start exploring the endless possibilities of connecting with like-minded individuals.</p>
      </div>
      <div className='info'>
        <div>
          <img src={groupImage}></img>
          <button ><Link to={'/groups'} style={{ textDecorationLine: "none" }}>See all Groups</Link></button>
        </div>
        <div>
          <img src={eventImage} alt="" />
          <button ><Link to={'/events'} style={{ textDecorationLine: "none" }}>Find an Event</Link></button>
        </div>
      </div>
      <div className='StartGroup'>
        <button disabled={!loggedIn}><Link  style={{ textDecorationLine: "none" }}>Start a group</Link></button>
      </div>
     
    </div>
  )
}
