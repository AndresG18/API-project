import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, BrowserRouter, Routes, Route} from 'react-router-dom';
// import LoginFormPage from './components/LoginFormPage';
import SignupFormPage from './components/SignupFormPage';
// import NavigationLink from './components/Navigation/Navigation-bonus';
import Navigation from './components/Navigation/Navigation';
import * as sessionActions from './store/session';
import { Modal } from './context/Modal';
import HomePage from './components/Home/HomePage';
import GroupForm from './components/GroupForm/GroupForm.jsx';
import GroupList from './components/GroupList/GroupList';
import EventList from './components/EventList';
import GroupShow from './components/GroupShow';
function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
    <Modal modal ={Modal}/>
    <Navigation isLoaded={isLoaded}/>
    <Outlet/>

    </>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Layout />
        <Routes>
          <Route path='/' element={<HomePage/>} />
          <Route path='/groups' element={<GroupList/>} />
          <Route path='/groups/:groupId' element={<GroupShow/>} />
          <Route path='/groups/new' element={<GroupForm/>}/>
          <Route path='/groups/:groupId/edit' element={null} />
          <Route path='/events'element={<EventList/>} />
          <Route path='/groups/:groupId/events/new' element={null} />
          <Route path='/events:eventId' element={null} />
          <Route path='/groups/:groupId/events/:eventId/edit' element={null} />
          <Route path='/signup' element={<SignupFormPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

// const router = createBrowserRouter([
//   {
//     element: <Layout />,
//     children: [
//       {
//         path: '/',
//         element: <h1>Welcome!</h1>
//       },
//       // {
//       //   path: 'login',
//       //   element: <LoginFormPage />
//       // },
//       // {
//       //   path: 'signup',
//       //   element: <SignupFormPage />
//       // }
//     ]
//   }
// ]);