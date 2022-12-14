import React, { useContext, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import Button from '../../shared/components/FormElements/Button'
import Input from '../../shared/components/FormElements/Input'
import { useForm } from '../../shared/components/hooks/form-hook'
import { useHttpClient } from '../../shared/components/hooks/http-hook'
import Card from '../../shared/components/UIElements/Card'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/utils/validators'
import { AuthContext } from '../../user/components/context/auth-context'
import './PlaceForm.css'

const UpdatePlace = (props) => {
  const [loadedPlace, setLoadedPlace] = useState()
  const { userId, token } = useContext(AuthContext)
  const { isLoading, sendRequest, error, clearError } = useHttpClient()
  const placeId = useParams().placeId
  const history = useHistory()

  const [formState, inputHandler, setFormData] = useForm({
    title: {
      value: '',
      isValid: false
    },
    description: {
      value: '',
      isValid: false
    }
  }, false)

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const result = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`)
        setLoadedPlace(result.place)
        setFormData({
          title: {
            value: result.place.title,
            isValid: true
          },
          description: {
            value: result.place.description,
            isValid: true
          }
        }, true)
      } catch (error) {}
    }
    fetchPlace()
  }, [sendRequest, placeId, setFormData])

  const updatePlaceSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`, 'PATCH', JSON.stringify({
        title: formState.inputs.title.value,
        description: formState.inputs.description.value
      }),
      { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }
      )
      history.push('/' + userId + '/places')
    } catch (error) {}
  }

  if (isLoading) {
    return (
      <div className='center'>
        <LoadingSpinner />
      </div>
    )
  }

  if (!loadedPlace && !error) {
    return (
      <div className='center'>
        <Card>
          <h2>Could not find the place!</h2>
        </Card>
      </div>
    )
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedPlace &&
        <form className='place-form' onSubmit={updatePlaceSubmitHandler}>
          <Input
            id='title'
            type='text'
            label='Title'
            element='input'
            validators={[VALIDATOR_REQUIRE()]}
            errorText='Please enter a valid address'
            onInput={inputHandler}
            value={loadedPlace.title}
            valid
          />
          <Input
            id='description'
            element='textarea'
            label='Description'
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText='Please enter a valid description (min 5 characters).'
            onInput={inputHandler}
            value={loadedPlace.description}
            valid
          />
          <Button type='submit' disabled={!formState.isValid}>UPDATE PLACE </Button>
        </form>}
    </>
  )
}

export default UpdatePlace
