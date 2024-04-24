import { useEffect, useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';
// import { useNavigate } from 'react-router-dom';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [err, setErr] = useState(false)
  const { closeModal } = useModal();


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
      if (response.ok){
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
