import './GroupList.css'
import * as GroupAction from '../../store/Groups'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react';
import GroupDetails from '../GroupDetails';
import { getEventsThunk } from '../../store/events';
import { NavLink } from 'react-router-dom';

export default function GroupList() {
    const groups = useSelector(state => state.groups)
    const groupsArr = Object.values(groups)
    return (
        <div className='groups'>
            {<GroupOrEvent />}
            
            <div className='group'>
            <h2>Groups in GatherX</h2>
                {groupsArr.map(group =>
                    <GroupDetails key={group.id} group={group}  />)}
            </div>
        </div>
    )
}
export function GroupOrEvent() {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(GroupAction.getGroupsThunk())
        dispatch(getEventsThunk())
    }, [dispatch])
    return (
        <div className='group-event-links'>
            <div>
                <h1><NavLink to={'/events'}>Events</NavLink></h1>
            </div>
            <div>
                <h1><NavLink to={'/groups'}>Groups</NavLink></h1>
            </div>
        </div>
    )
}
