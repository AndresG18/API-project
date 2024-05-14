import { useEffect, useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';
import { csrfFetch } from '../../store/csrf';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [err, setErr] = useState(false)
  const { closeModal } = useModal();

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
    } catch (e) {
      const err = await e.json()
      setErrors(err)
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Log In</h1>
      <ul className="loginDemo-btn">
        <li>
          <button onClick={handleClick}>
            Login as demo user
          </button>
        </li>
      </ul>
      <form className="login-form" onSubmit={handleSubmit}>
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
        {errors && <p className="error-message"> {Object.values(errors)} </p>}
        <button className="login-btn" disabled={err == true} type="submit">Log In</button>
      </form>
    </div>
  );
}

export default LoginFormModal;
