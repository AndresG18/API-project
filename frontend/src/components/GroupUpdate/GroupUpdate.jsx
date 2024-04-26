import GroupForm from '../GroupForm/GroupForm'
import './GroupUpdate.css'
import { useSelector } from 'react-redux/es/hooks/useSelector'
function GroupUpdate() {
    const group = useSelector(state =>  state.currGroup )
  return (
   <>
   <GroupForm group={group}/>
   </>
  )
}

export default GroupUpdate