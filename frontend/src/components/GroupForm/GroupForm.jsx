import  { useEffect, useState } from 'react';
import './GroupForm.css';
import { csrfFetch } from '../../store/csrf';
import { useDispatch, useSelector } from 'react-redux';
import { createGroupThunk, editGroupThunk } from '../../store/Group';
import { useNavigate } from 'react-router-dom';

function GroupForm({ group }) {
  const user = useSelector(state => state.session.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [type, setType] = useState('');
  const [imgUrl, setImgUrl] = useState('');

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(false);

  useEffect(() => {
    if (!user) navigate('/');
    if (group?.organizerId && user.id !== group.organizerId) navigate('/');
    setLocation(group?.city ? `${group.city},${group.state}` : '');
    setName(group?.name || '');
    setDescription(group?.about || '');
    setIsPrivate(group?.private === true); 
    setType(group?.type || '');
    setImgUrl(group?.GroupImages?.length ? group.GroupImages[0].url : '');
  }, [group, navigate, user]);

  const createGroupImage = async (groupId, imgObj) => {
    const response = await csrfFetch(`/api/groups/${groupId}/images`, {
      method: 'POST',
      body: JSON.stringify(imgObj)
    });
    const data = await response.json();
    return data;
  };

  useEffect(() => {
    const validateForm = () => {
      const newErrors = {};
      if (!location.trim()) newErrors.location = 'Location is required';
      if (!name.trim()) newErrors.name = 'Name is required';
      if (description.length < 50) newErrors.description = 'Description must be at least 50 characters long';
      if (!isPrivate) newErrors.isPrivate = 'Visibility Type is required';
      if (!type.trim()) newErrors.type = 'Group Type is required';
      if (!imgUrl.trim().match(/\.(png|jpg|jpeg)$/)) newErrors.imgUrl = 'Image URL must end in .png, .jpg, or .jpeg';
      setErrors(newErrors);
    };
    validateForm();
  }, [location, name, description, isPrivate, type, imgUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'location':
        setLocation(value);
        break;
      case 'name':
        setName(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'isPrivate':
        setIsPrivate(value === 'true'); // Convert string to boolean
        break;
      case 'type':
        setType(value);
        break;
      case 'imgUrl':
        setImgUrl(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(Object.keys(errors).length > 0);
    if (formError) return;

    const city = location.split(',')[0];
    const state = location.split(',')[1];
    const reqObj = { name, about: description, type, private: isPrivate, city, state };
    const imgObj = { url: imgUrl, preview: true };

    try {
      const data = group ? await dispatch(editGroupThunk(reqObj, group.id)) : await dispatch(createGroupThunk(reqObj));
      if (data.errors) {
        setFormError(true);
        setErrors({
          location: `${data.errors.city}, ${data.errors.state}`,
          name: data.errors.name,
          description: data.errors.about,
        });
      } else {
        if (imgUrl.trim()) await createGroupImage(group ? group.id : data.id, imgObj);
        navigate(`/groups/${group ? group.id : data.id}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1 className='form-title'>{group ? 'Update your group' : 'Start a New Group'}</h1>
      <form onSubmit={handleSubmit}>
        <div className='form-section'>
          <h3>Set your group&apos;s location.</h3>
          <p>GatherX groups meet locally, in person and online. We&apos;ll connect you with people in your area.</p>
          <input
            type='text'
            name='location'
            placeholder='City, STATE'
            value={location}
            onChange={handleChange}
          />
          {formError && errors.location && <div className='error-message'>{errors.location}</div>}
        </div>
        <div className='form-section'>
          <h3>What will your group&apos;s name be?</h3>
          <p>Choose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind.</p>
          <input
            type='text'
            name='name'
            placeholder='What is your group name?'
            value={name}
            onChange={handleChange}
          />
          {formError && errors.name && <div className='error-message'>{errors.name}</div>}
        </div>
        <div className='form-section'>
          <h3>{"Describe the purpose of your group."}</h3>
          <p>People will see this when we promote your group, but you&apos;ll be able to add to it later, too.</p>
          <p>{"1. What's the purpose of the group?"}</p>
          <p>2. Who should join?</p>
          <p>3. What will you do at your events?</p>
          <textarea
            name='description'
            placeholder='Please write at least 50 characters'
            value={description}
            onChange={handleChange}
          />
          {formError && errors.description && <div className='error-message'>{errors.description}</div>}
        </div>
        <div className='form-section'>
          <h3>More Details </h3>
          <div>
            <p>Is this an in person or online group?</p>
            <select
              name='type'
              value={type}
              onChange={handleChange}
            >
              <option value=''>Select one</option>
              <option value='In person'>In person</option>
              <option value='Online'>Online</option>
            </select>
            {formError && errors.type && <div className='error-message'>{errors.type}</div>}
          </div>
          <div>
            <p>Please select the visibility of your group:</p>
            <select
              name='isPrivate'
              value={String(isPrivate)}
              onChange={handleChange}
            >
              <option value=''>Select one</option>
              <option value='true'>Private</option>
              <option value='false'>Public</option>
            </select>
            {formError && errors.isPrivate && <div className='error-message'>{errors.isPrivate}</div>}
          </div>
          <div>
            <p>Please add an image URL for your group below:</p>
            <input
              type='text'
              name='imgUrl'
              placeholder='Image URL'
              value={imgUrl}
              onChange={handleChange}
            />
            {formError && errors.imgUrl && <div className='error-message'>{errors.imgUrl}</div>}
          </div>
          <button type='submit'>{!group ? 'Create group' : 'Update group'}</button>
        </div>
      </form>
    </div>
  );
}

export default GroupForm;
