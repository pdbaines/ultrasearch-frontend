import './index.css'

import { useCallback, useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { BrowserRouter } from "react-router-dom";

import EventMap from './components/eventMap'
import EventTable from './components/eventTable'
import NavBar from './components/navBar'

import { GridRowsProp } from '@mui/x-data-grid';

const rows: GridRowsProp = [
    { id: 1, name: 'John McQueen' },
    { id: 2, name: 'Mary Stones' }
];


function App() {


  // Need shared state for data for map and table,
  // so time to move away from function to storing data in state

  const [events, setEvents] = useState([]);

  // Regular object (✓):
  // const events_json = [['foo'], ['bar']];

  // Regular function (✓):
  // function events_func(){
  //   return [['fooey'], ['barry']]
  // };

  // Via supbase client (✓):
  // Needs error handling, null result handling, 
  // performance improvements, security etc. but works
  const events_supabase_func = async() => {
    let {data, error, status } = await supabase.from('events').select(`
      id,
      name,
      url,
      city,
      state,
      country,
      start_date,
      latitude,
      longitude,
      event_distances(
        distance,
        distance_units(
          unit_name
        )
      )
    `)
    // Example equality filter:
    // .eq('name', 'Habanero Hundred');
    console.log('status: ', status)
    console.log('error: ', error)
    console.log('data: ', data)

    data = data.map(function(e) { 
      e.event_distances = e.event_distances.flatMap(x => x.distance + ' ' + x.distance_units.unit_name).join(', '); 
      return e;
    });
    console.log('data: ', data)
    setEvents(data)
    return data
  };

  useEffect(() => {
    events_supabase_func()
  }, []);

  // Return JSX
  return (
    <div>
    <div>
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    </div>
    <div style={{ padding: '50px 100px 100px 100px' }}>
      <EventMap events={events} />
        <div style={{ height: 800, width: '100%'}}>
          <EventTable events={rows} />
        </div>
      <br></br>
    </div>
    <div>
    
    </div>
    </div>
  )

}

export default App;
