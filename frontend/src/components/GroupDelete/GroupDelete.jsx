import { csrfFetch } from '../../store/csrf'
import './GroupDelete.css'
import { useModal } from '../../context/Modal'
// import { useNavigate } from 'react-router-dom'


function GroupDelete({group,setDelete}) {
// const navigate = useNavigate()

const {closeModal} = useModal()

const handleDelete = async() =>{
      await csrfFetch(`/api/groups/${group.id}`, {
        method: "DELETE"
    });
    closeModal();
    setDelete(true)
    window.alert('Group was Successfully deleted')
}
const handleClose = (e)=>{
    e.preventDefault();
    closeModal()
}

  return (
    <div>
        <h1> Are you sure you want to delete {group.name} ?</h1>
        <div>
            <button onClick={handleDelete} >
                Yes
            </button>
            <button onClick={handleClose}>
                Cancel
            </button>
        </div>
    </div>
  )
}

export default GroupDelete