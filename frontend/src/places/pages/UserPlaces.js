import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useHttpClient } from '../../shared/components/hooks/http-hook'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'
import PlaceList from '../components/PlaceList'

const UserPlaces = () => {
  const [loadedPlaces, setLoadedPlaces] = useState()
  const { isLoading, error, clearError, sendRequest } = useHttpClient()
  const userId = useParams().userId

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const result = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places/user/${userId}`)
        setLoadedPlaces(result.places)
      } catch (error) {}
    }
    fetchPlaces()
  }, [sendRequest, userId])

  const placeDeleteHandler = (deletedPlaceId) => {
    setLoadedPlaces(prevPlaces => prevPlaces.filter(place => place.id !== deletedPlaceId))
  }
  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <div className='center'><LoadingSpinner /></div>}
      {!isLoading && loadedPlaces && <PlaceList items={loadedPlaces} onDeletePlace={placeDeleteHandler} />}
    </>
  )
}

export default UserPlaces
