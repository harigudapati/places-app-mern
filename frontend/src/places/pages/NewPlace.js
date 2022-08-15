import React, { useContext } from 'react'
import Input from '../../shared/components/FormElements/Input'
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/utils/validators'
import './PlaceForm.css'
import Button from '../../shared/components/FormElements/Button'
import { useForm } from '../../shared/components/hooks/form-hook'
import { useHttpClient } from '../../shared/components/hooks/http-hook'
import { AuthContext } from '../../user/components/context/auth-context'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import { useHistory } from 'react-router-dom'
import ImageUpload from '../../shared/components/FormElements/ImageUpload'

const NewPlace = () => {
  const { isLoading, error, clearError, sendRequest } = useHttpClient()
  const { token } = useContext(AuthContext)
  const history = useHistory()
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      },
      address: {
        value: '',
        isValid: false
      },
      image: {
        value: null,
        isValid: false
      }
    },
    false
  )

  const placeSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      const formData = new window.FormData()
      formData.append('title', formState.inputs.title.value)
      formData.append('description', formState.inputs.description.value)
      formData.append('address', formState.inputs.address.value)
      formData.append('image', formState.inputs.image.value)
      await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places`, 'POST', formData, { Authorization: 'Bearer ' + token })
      history.push('/')
    } catch (error) {}
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <form className='place-form' onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          element='input'
          id='title'
          type='text'
          label='Title'
          validators={[VALIDATOR_REQUIRE()]}
          onInput={inputHandler}
          errorText='Please enter a valid title.'
        />
        <Input
          id='description'
          label='Description'
          validators={[VALIDATOR_MINLENGTH(5)]}
          onInput={inputHandler}
          errorText='Please enter a valid description(at least 5 characters).'
        />
        <Input
          id='address'
          element='input'
          label='Address'
          validators={[VALIDATOR_REQUIRE()]}
          onInput={inputHandler}
          errorText='Please enter a valid address.'
        />
        <ImageUpload id='image' onInput={inputHandler} errorText='Please provide an image.' />
        <Button type='submit' disabled={!formState.isValid}>ADD PLACE</Button>
      </form>
    </>
  )
}

export default NewPlace
