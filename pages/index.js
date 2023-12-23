import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const Ticket = ({ ticket}) => {
  return (
    <div className='border p-4 m-4'>
      <strong>{ticket.title}</strong>
      <p>Status: {ticket.status}</p>
      <p>User: {ticket.user}</p>
      <p>Priority: {ticket.priority}</p>
    </div>
  )
}
const KanbanBoard = ({
  tickets,
  moveTicket,
  groupingOption,
  sortingOption,
}) => {
  let groupedTickets

  switch (groupingOption) {
    case 'status':
      const uniqueStatuses = [
        ...new Set(tickets.map((ticket) => ticket.status)),
      ]
      groupedTickets = uniqueStatuses.reduce((acc, status) => {
        acc[status] = tickets.filter((ticket) => ticket.status === status)
        return acc
      }, {})
      break
    case 'user':
      const uniqueUsers = [...new Set(tickets.map((ticket) => ticket.userId))]
      groupedTickets = uniqueUsers.reduce((acc, userId) => {
        acc[userId] = tickets.filter((ticket) => ticket.userId === userId)
        return acc
      }, {})
      break
    case 'priority':
      const uniquePriorities = [
        ...new Set(tickets.map((ticket) => ticket.priority)),
      ]
      groupedTickets = uniquePriorities.reduce((acc, priority) => {
        acc[priority] = tickets.filter((ticket) => ticket.priority === priority)
        return acc
      }, {})
      break
    default:
      groupedTickets = {}
  }

  // Sort each group based on the selected sorting option
  Object.values(groupedTickets).forEach((group) => {
    switch (sortingOption) {
      case 'priority':
        group.sort((a, b) => b.priority - a.priority)
        break
      case 'title':
        group.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
      // Do nothing for default case
    }
  })

  return (
    <div className='flex justify-around mt-8'>
      {Object.entries(groupedTickets).map(([groupKey, groupTickets]) => (
        <div key={groupKey} className='w-72'>
          <h2 className='text-2xl font-semibold mb-4'>{groupKey}</h2>
          {groupTickets.map((ticket, index) => (
            <Ticket
              key={ticket.id}
              index={index}
              ticket={ticket}
              moveTicket={moveTicket}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

const Home = () => {
  const [tickets, setTickets] = useState([])
  const [viewState, setViewState] = useState({
    grouping: 'status',
    sorting: 'priority',
    theme: 'light',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL)
        setTickets(response.data?.tickets)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const moveTicket = (fromIndex, toIndex) => {
    const updatedTickets = [...tickets]
    const [movedTicket] = updatedTickets.splice(fromIndex, 1)
    updatedTickets.splice(toIndex, 0, movedTicket)
    setTickets(updatedTickets)
  }

  return (
    <div
      className={`min-h-screen ${
        viewState.theme === 'dark'
          ? 'bg-gray-800 text-white'
          : 'bg-white text-black'
      }`}
    >
      <nav
        className={`p-4 ${
          viewState.theme === 'dark'
            ? 'bg-gray-800 text-white border-b border-l border-gray-600 z-1'
            : ' text-black'
        } border-b border-l z-1`}
      >
        <div className='flex items-center justify-between'>
          <Link
            href={`/`}
            className='font-bold text-3xl bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text hover:cursor-pointer'
          >
            KanbanBoard
          </Link>
          <div className='flex items-center space-x-4'>
            <label
              className={`flex items-center ${
                viewState.theme === 'dark' ? 'text-white' : ' text-black'
              }`}
            >
              Group by:
              <select
                value={viewState.grouping}
                onChange={(e) =>
                  setViewState({ ...viewState, grouping: e.target.value })
                }
                className='ml-2 p-2 rounded text-black'
              >
                <option value='status' className='text-black'>
                  Status
                </option>
                <option value='user' className='text-black'>
                  User
                </option>
                <option value='priority' className='text-black'>
                  Priority
                </option>
              </select>
            </label>
            <label
              className={`flex items-center ${
                viewState.theme === 'dark' ? 'text-white' : ' text-black'
              }`}
            >
              Sort by:
              <select
                value={viewState.sorting}
                onChange={(e) =>
                  setViewState({ ...viewState, sorting: e.target.value })
                }
                className='ml-2 p-2 rounded text-black'
              >
                <option value='priority' className='text-black'>
                  Priority
                </option>
                <option value='title' className='text-black'>
                  Title
                </option>
              </select>
            </label>
            <label
              className={`ml-4 ${
                viewState.theme === 'dark' ? 'text-white' : ' text-black'
              }`}
            >
              Theme:
              <select
                value={viewState.theme}
                onChange={(e) =>
                  setViewState({ ...viewState, theme: e.target.value })
                }
                className='ml-2 p-2 roundedclassName text-black'
              >
                <option value='light' className='text-black'>
                  Light
                </option>
                <option value='dark' className='text-black'>
                  Dark
                </option>
              </select>
            </label>
          </div>
        </div>
      </nav>
      <KanbanBoard
        tickets={tickets}
        moveTicket={moveTicket}
        groupingOption={viewState.grouping}
        sortingOption={viewState.sorting}
      />
    </div>
  )
}

export default Home
