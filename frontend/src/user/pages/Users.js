import React, { useEffect, useState } from 'react'
import { useHttpClient } from '../../shared/components/hooks/http-hook'
import ErrorModal from '../../shared/components/UIElements/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner'

import UsersList from '../components/UsersList'

const Users = () => {
  const { isLoading, error, clearError, sendRequest } = useHttpClient()
  const [loadedUsers, setLoadedUsers] = useState()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/users`)
        setLoadedUsers(result.users)
      } catch (error) {
      }
    }
    fetchUsers()
  }, [sendRequest])

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading &&
        <div className='center'>
          <LoadingSpinner />
        </div>}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
    </>
  )
}

export default Users
