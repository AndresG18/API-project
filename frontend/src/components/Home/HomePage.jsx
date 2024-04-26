import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { useSelector } from 'react-redux';
import SignupFormModal from '../SignupFormModal';
import OpenModalButton from '../OpenModalButton';

export default function HomePage() {
  const eventImage = "https://img-cdn.pixlr.com/image-generator/history/6626effc9ed75f6255bbcd0d/36f577f6-8226-4377-b9f2-285a97763231/medium.webp";
  const groupImage = "https://as1.ftcdn.net/v2/jpg/02/87/38/58/1000_F_287385828_ejLYE0aDPELQPOzEgEINOfr2M201c3E6.jpg";
  const sessionUser = useSelector(state => state.session.user);
  const navigate = useNavigate();
  const loggedIn = sessionUser ? (
    <></>
  ) : (
    <div className='Join'>
      <OpenModalButton 
        buttonText="Join GatherX"
        modalComponent={<SignupFormModal />}
      />
    </div>
  );
  const handleClick = (e) =>{
    e.preventDefault();
    navigate('/groups/new')
  }
  const handleEvent=(e)=>{
    e.preventDefault();
    navigate('/events')
  }
  const handleGroup = (e)=>{
    e.preventDefault();
    navigate('/groups')
  }
  return (
    <div>
      <div className='introduction'>
        <h1>Discover new friends who share your interests </h1>
        <p>-Whether you&rsquo;re into hiking, reading, networking, or skill-sharing, there&rsquo;s a vibrant community waiting for you. With events taking place daily, there&rsquo;s always something exciting to join. Sign up now and start exploring the endless possibilities of connecting with like-minded individuals.</p>
      </div>
      <div className='info'>
        <div>
          <img src={groupImage} alt="Group" />
          <button onClick={handleGroup}> See all </button>
        </div>
        <div>
          <img src={eventImage} alt="Event" />
          <button onClick={handleEvent}>Find an Event</button>
        </div>
      </div>
      <div className='StartGroup'>
        <button onClick={handleClick} style={{fontFamily:"Kaushan Script"}} disabled={!loggedIn}>Start a group</button>
      </div>
      {loggedIn}
    </div>
  );
}
