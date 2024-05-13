import { useEffect, useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';
import { csrfFetch } from '../../store/csrf';
// import { useNavigate } from 'react-router-dom';
// import { UseSelector } from 'react-redux/es/hooks/useSelector';
function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [err, setErr] = useState(false)
  const { closeModal } = useModal();
  // const sessionUser = useSelector(state => state.session.user);
  const handleClick = async (e) => {
    e.preventDefault();
    await csrfFetch('/api/session', {
      method: "POST",
      body: JSON.stringify({ credential: "Demo-lition", password: 'password' })
    });
    window.location.replace('/')
  }

  useEffect(() => {
    if (credential.length < 4 || password.length < 6) setErr(true)
    else setErr(false)
  }, [credential, password])
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    try {
      e.preventDefault()
      const response = await dispatch(sessionActions.login({ credential, password }));
      if (response.ok) {
        closeModal();
      }

    }
    catch (e) {
      const err = await e.json()
      setErrors(err)
    }

  };

  return (
    <>
      <h1>Log In</h1>
      <li style={{margin:"10px"}} >
        <button onClick={handleClick} className='logout'>
          Login as demo user
        </button>
      </li>
      <form onSubmit={handleSubmit}>
        <label>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors && <p> {Object.values(errors)} </p>}
        <button disabled={err == true} type="submit">Log In</button>
      </form>
    </>
  );
}

export default LoginFormModal;
