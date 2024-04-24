import { NavLink,Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import OpenModalButton from '../OpenModalButton';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  const sessionLinks = sessionUser ?
    (
      <div className='GroupFormLink'>
        <Link to="/api/groups/new" >Start a new group</Link>
      <li>
        <ProfileButton user={sessionUser} />
      </li>
      </div>
    ) : (
      <>
      <div className='login'>
        <li>
          <OpenModalButton
            buttonText="Log In"
            modalComponent={<LoginFormModal />}
          />
          {/* <NavLink to="/login">Log In</NavLink> */}
        </li>
        <li  className="signup">
          <OpenModalButton
            buttonText="Sign Up"
         
            modalComponent={<SignupFormModal />}
          />
          {/* <NavLink to="/signup">Sign Up</NavLink> */}
        </li>
        </div>
      </>
    );

  return (
    <ul className='ulHeader'>
      <li>
        <NavLink className="websiteName" to="/">GatherX</NavLink>
      </li>
      {isLoaded && sessionLinks}
    </ul>
  );
}

export default Navigation;
